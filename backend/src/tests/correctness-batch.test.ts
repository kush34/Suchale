// Regression tests for issue #15: follow/OTP/like/story correctness batch.
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const presence = new Map<string, string>();
jest.mock("../utils/redis", () => ({
  __esModule: true,
  default: {
    hset: jest.fn((k: string, f: string, v: string) => {
      presence.set(`${k}:${f}`, v);
      return Promise.resolve(1);
    }),
    hget: jest.fn((k: string, f: string) => Promise.resolve(presence.get(`${k}:${f}`) ?? null)),
    hdel: jest.fn(() => Promise.resolve(1)),
    hgetall: jest.fn(() => Promise.resolve({})),
  },
}));
jest.mock("../config/firebase", () => ({
  __esModule: true,
  default: { auth: () => ({ verifyIdToken: jest.fn() }) },
}));
jest.mock("../controllers/sendOtp", () => ({
  __esModule: true,
  default: jest.fn(),
  sendOtp: jest.fn(),
}));
jest.mock("../utils/webpush", () => ({
  __esModule: true,
  default: { sendNotification: jest.fn() },
}));
jest.mock("../index", () => ({
  __esModule: true,
  io: { to: () => ({ emit: jest.fn() }), sockets: { sockets: new Map() } },
  default: { listen: jest.fn() },
}));
const mockResource = jest.fn();
jest.mock("../utils/cloudinary", () => ({
  __esModule: true,
  default: {
    api: { resource: (...a: any[]) => mockResource(...a), ping: jest.fn() },
    uploader: { destroy: jest.fn() },
    utils: { api_sign_request: jest.fn() },
  },
}));
// deterministic OTPs: crypto.randomInt always yields 123456
jest.mock("crypto", () => {
  const actual = jest.requireActual("crypto");
  return { ...actual, randomInt: jest.fn(() => 123456), default: { ...actual, randomInt: jest.fn(() => 123456) } };
});

process.env.jwt_Secret = process.env.jwt_Secret || "test-secret-15";
process.env.OTP_TTL_MS = "120";

// require after env+mocks: OTP_TTL_MS is read at userService module load
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendMailService, verifyOtpService, followUserByUsername } = require("../services/userService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createStory } = require("../services/storyService");

import User from "../models/userModel";
import Post from "../models/postModel";
import Story from "../models/storyModel";
import postRouter from "../routers/postRouter";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/post", postRouter);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 120000);

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Story.deleteMany({})]);
  mockResource.mockReset();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

async function makeUser(username: string) {
  return User.create({ username, email: `${username}@ex.com`, password: "password123" });
}
const cookieFor = (u: any) =>
  `token=${jwt.sign({ username: u.username, email: u.email, id: u._id }, process.env.jwt_Secret!)}`;

describe("follow", () => {
  test("double follow stores a single entry on both sides", async () => {
    const a = await makeUser("FolA");
    const b = await makeUser("FolB");
    await followUserByUsername(a._id.toString(), b.username);
    await followUserByUsername(a._id.toString(), b.username);
    const [fa, fb] = await Promise.all([User.findById(a._id), User.findById(b._id)]);
    expect(fa!.following.map(String)).toEqual([String(b._id)]);
    expect(fb!.followers.map(String)).toEqual([String(a._id)]);
  });

  test("self-follow is rejected", async () => {
    const a = await makeUser("FolSelf");
    const res = await followUserByUsername(a._id.toString(), a.username);
    expect(res.code).toBe(400);
    expect((await User.findById(a._id))!.following.length).toBe(0);
  });
});

describe("OTP", () => {
  test("correct OTP creates the user", async () => {
    const sent = await sendMailService("otp-ok@ex.com", "OtpOk", "password123");
    expect(sent.status).toBe("success");
    const res = await verifyOtpService({ email: "otp-ok@ex.com", otp: 123456, username: "OtpOk", password: "password123" });
    expect(res.status).toBe("success");
    expect(await User.findOne({ email: "otp-ok@ex.com" })).not.toBeNull();
  });

  test("five wrong guesses burn the OTP", async () => {
    await sendMailService("otp-burn@ex.com", "OtpBurn", "password123");
    for (let i = 0; i < 5; i++) {
      const r = await verifyOtpService({ email: "otp-burn@ex.com", otp: 999999, username: "OtpBurn", password: "password123" });
      expect(r.message).toBe("Invalid OTP");
    }
    const burnt = await verifyOtpService({ email: "otp-burn@ex.com", otp: 123456, username: "OtpBurn", password: "password123" });
    expect(burnt.message).toBe("Too many attempts");
    expect(await User.findOne({ email: "otp-burn@ex.com" })).toBeNull();
  });

  test("expired OTP is rejected", async () => {
    await sendMailService("otp-exp@ex.com", "OtpExp", "password123");
    await new Promise((r) => setTimeout(r, 250)); // OTP_TTL_MS=120
    const res = await verifyOtpService({ email: "otp-exp@ex.com", otp: 123456, username: "OtpExp", password: "password123" });
    expect(res.message).toBe("OTP expired");
    expect(await User.findOne({ email: "otp-exp@ex.com" })).toBeNull();
  });
});

describe("like toggle", () => {
  test("sequential toggle likes then unlikes; concurrent taps never duplicate", async () => {
    const u = await makeUser("LikeU");
    const post = await Post.create({ user: u._id, content: "hello world" });
    const jar = cookieFor(u);
    const likes = () => Post.findById(post._id).then((p) => p!.engagement.likes.length);

    const r1 = await request(app).post(`/post/like/${post._id}`).set("Cookie", jar);
    expect(r1.body.message).toBe("Liked the post");
    expect(await likes()).toBe(1);

    // two taps at once: each flips exactly once, so entries never duplicate
    const [c1, c2] = await Promise.all([
      request(app).post(`/post/like/${post._id}`).set("Cookie", jar),
      request(app).post(`/post/like/${post._id}`).set("Cookie", jar),
    ]);
    expect(c1.statusCode).toBe(200);
    expect(c2.statusCode).toBe(200);
    expect(await likes()).toBeLessThanOrEqual(1);
  });

  test("invalid postId returns 400, unknown postId returns 404", async () => {
    const u = await makeUser("LikeU2");
    const jar = cookieFor(u);
    expect(await request(app).post("/post/like/nope").set("Cookie", jar).then((r) => r.statusCode)).toBe(400);
    expect(
      await request(app).post(`/post/like/${new mongoose.Types.ObjectId()}`).set("Cookie", jar).then((r) => r.statusCode)
    ).toBe(404);
  });
});

describe("story upload verification", () => {
  const serverAsset = (userId: string, over: any = {}) => ({
    public_id: "stories/abc123",
    secure_url: "https://res.cloudinary.com/x/stories/abc123.jpg",
    resource_type: "image",
    format: "jpg",
    width: 1080,
    height: 1920,
    tags: ["story", `user:${userId}`],
    ...over,
  });
  const body = {
    caption: "hi",
    publicId: "stories/abc123",
    url: "https://evil.example/hotlink.jpg",
    resourceType: "image" as const,
  };

  test("valid signed upload is stored with server-side values", async () => {
    const u = await makeUser("StoryU");
    mockResource.mockResolvedValue(serverAsset(u._id.toString()));
    const story = await createStory({ userId: u._id.toString(), body });
    expect(story.media.url).toBe("https://res.cloudinary.com/x/stories/abc123.jpg");
    expect(story.media.publicId).toBe("stories/abc123");
  });

  test("missing upload is rejected", async () => {
    const u = await makeUser("StoryU2");
    mockResource.mockRejectedValue(new Error("not found"));
    await expect(createStory({ userId: u._id.toString(), body })).rejects.toThrow(/Upload not found/);
    expect(await Story.countDocuments({})).toBe(0);
  });

  test("asset outside stories/ is rejected", async () => {
    const u = await makeUser("StoryU3");
    mockResource.mockResolvedValue(serverAsset(u._id.toString(), { public_id: "avatars/evil" }));
    await expect(createStory({ userId: u._id.toString(), body })).rejects.toThrow(/not a story asset/);
  });

  test("another user's asset is rejected", async () => {
    const u = await makeUser("StoryU4");
    mockResource.mockResolvedValue(serverAsset("someone-else"));
    await expect(createStory({ userId: u._id.toString(), body })).rejects.toThrow(/does not belong/);
  });
});
