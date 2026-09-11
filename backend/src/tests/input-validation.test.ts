// Regression tests for issue #16: regex injection + input validation.
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("../utils/redis", () => ({
  __esModule: true,
  default: { hset: jest.fn(), hget: jest.fn(), hdel: jest.fn(), hgetall: jest.fn() },
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
jest.mock("../utils/cloudinary", () => ({
  __esModule: true,
  default: {
    api: { resource: jest.fn(), ping: jest.fn() },
    uploader: { destroy: jest.fn() },
    utils: { api_sign_request: jest.fn() },
  },
}));

import { escapeRegExp, searchRegex, clampInt, isTruthy } from "../utils/input";
import User from "../models/userModel";
import Post from "../models/postModel";
import Message from "../models/messageModel";
import { searchUsers } from "../services/userService";
import { search as exploreSearch } from "../services/exploreService";
import { searchUserMsgs } from "../services/messageService";
import postRouter from "../routers/postRouter";
import messageRouter from "../routers/messageRouter";
import exploreRouter from "../routers/exploreRouter";
import notificationRouter from "../routers/notificationRouter";
import storyRouter from "../routers/storyRouter";

process.env.jwt_Secret = process.env.jwt_Secret || "test-secret-16";
process.env.CLOUDINARY_API_KEY = "key";
process.env.CLOUDINARY_API_SECRET = "secret";
process.env.CLOUDINARY_CLOUD_NAME = "cloud";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/post", postRouter);
app.use("/message", messageRouter);
app.use("/explore", exploreRouter);
app.use("/notifications", notificationRouter);
app.use("/story", storyRouter);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 120000);

afterEach(async () => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Message.deleteMany({})]);
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

describe("input helpers", () => {
  test("regex metacharacters are treated literally", () => {
    expect(escapeRegExp("a.*(b+c)?")).toBe("a\\.\\*\\(b\\+c\\)\\?");
    expect(searchRegex(".*").test("anything")).toBe(false);
    expect(searchRegex("TeST").test("testuser")).toBe(true);
    expect(searchRegex("x".repeat(500)).source.length).toBeLessThanOrEqual(100 + 20);
  });

  test("clampInt falls back and clamps", () => {
    expect(clampInt(undefined, 20, 1, 50)).toBe(20);
    expect(clampInt("abc", 20, 1, 50)).toBe(20);
    expect(clampInt("-5", 1, 1, 50)).toBe(1);
    expect(clampInt("500", 20, 1, 50)).toBe(50);
    expect(clampInt("3", 20, 1, 50)).toBe(3);
  });

  test("isTruthy rejects truthy-strings", () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy("true")).toBe(true);
    expect(isTruthy("false")).toBe(false);
    expect(isTruthy("yes")).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
  });
});

describe("search injection", () => {
  test("explore search with regex payload matches literally, no throw", async () => {
    await makeUser("Alice16");
    const res = (await exploreSearch("(Alice|Bob).*")) as unknown as { users: unknown[]; posts: unknown[] };
    expect(res.users).toEqual([]);
    expect(res.posts).toEqual([]);
  });

  test("user search with regex payload matches literally", async () => {
    await makeUser("Bob16");
    expect(await searchUsers("Bob16.*")).toEqual([]);
    expect((await searchUsers("Bob16")).map((u) => u.username)).toContain("Bob16");
  });

  test("message search with regex payload matches literally", async () => {
    const a = await makeUser("MsgA16");
    const b = await makeUser("MsgB16");
    await Message.create({ fromUser: a.username, toUser: b.username, content: "hello there" });
    const res = await searchUserMsgs(a.username, ".*");
    expect(res.data).toEqual([]);
    const hit = await searchUserMsgs(a.username, "hello");
    expect(hit.data.length).toBe(1);
  });
});

describe("HTTP validation", () => {
  test('isGroup "false" string takes the DM path', async () => {
    const a = await makeUser("GrpStrA");
    const b = await makeUser("GrpStrB");
    await Message.create({ fromUser: a.username, toUser: b.username, content: "hi" });
    const res = await request(app)
      .post("/message/getMessages")
      .set("Cookie", cookieFor(a))
      .send({ toUser: b.username, isGroup: "false" });
    expect(res.statusCode).toBe(200);
    expect(res.body.messages.map((m: any) => m.content)).toContain("hi");
  });

  test("message limit is clamped to 50", async () => {
    const a = await makeUser("LimA");
    const b = await makeUser("LimB");
    await Message.insertMany(
      Array.from({ length: 60 }, (_, i) => ({ fromUser: a.username, toUser: b.username, content: `m${i}` }))
    );
    const res = await request(app)
      .post("/message/getMessages?limit=5000")
      .set("Cookie", cookieFor(a))
      .send({ toUser: b.username, isGroup: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.messages.length).toBeLessThanOrEqual(50);
  });

  test("comment rejects bad id and oversized content", async () => {
    const u = await makeUser("ComU");
    const jar = cookieFor(u);
    const post = await Post.create({ user: u._id, content: "hello world" });

    expect(
      await request(app).post("/post/comment/nope").set("Cookie", jar).send({ content: "x" }).then((r) => r.statusCode)
    ).toBe(400);
    expect(
      await request(app)
        .post(`/post/comment/${post._id}`)
        .set("Cookie", jar)
        .send({ content: "x".repeat(1001) })
        .then((r) => r.statusCode)
    ).toBe(400);
    const ok = await request(app)
      .post(`/post/comment/${post._id}`)
      .set("Cookie", jar)
      .send({ content: "nice" });
    expect(ok.statusCode).toBe(200);
  });

  test("getPostById rejects bad id instead of 500", async () => {
    const u = await makeUser("GPBU");
    const res = await request(app).get("/post/nope").set("Cookie", cookieFor(u));
    // route is GET /:postId handled by getPostById when not matching other GETs
    expect([400, 404]).toContain(res.statusCode);
  });

  test("mark-read rejects garbage ids with 400", async () => {
    const u = await makeUser("NotifU");
    const res = await request(app)
      .post("/notifications")
      .set("Cookie", cookieFor(u))
      .send({ ids: ["nope"] });
    expect(res.statusCode).toBe(400);
  });

  test("post create rejects non-Cloudinary media urls", async () => {
    const u = await makeUser("PostU");
    const res = await request(app)
      .post("/post")
      .set("Cookie", cookieFor(u))
      .send({ content: "", media: ["https://evil.example/x.jpg"], mentions: [], hashtags: [] });
    expect(res.statusCode).toBe(400);
  });

  test("presigned signature is scoped to the requester folder", async () => {
    const u = await makeUser("SignU");
    const res = await request(app).get("/post/preSignedUrl").set("Cookie", cookieFor(u));
    expect(res.statusCode).toBe(200);
    expect(res.body.folder).toBe(`posts/${u._id}`);
    expect(res.body.signature).toBeTruthy();
  });

  test("story viewers with malformed id returns 400", async () => {
    const u = await makeUser("StoryV");
    const res = await request(app).get("/story/nope/viewers").set("Cookie", cookieFor(u));
    expect(res.statusCode).toBe(400);
  });
});
