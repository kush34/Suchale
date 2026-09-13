// Tests for the unblock feature:
// 1) unblockUserByUsername service removes only the targeted user (idempotent).
// 2) HTTP surface: POST /user/unblockUser/:username clears the block,
//    GET /user/profile/:username reports isBlockedByMe before/after unblock,
//    unauthenticated requests are rejected.
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("../utils/redis", () => ({
  __esModule: true,
  default: {
    hset: jest.fn(() => Promise.resolve(1)),
    hget: jest.fn(() => Promise.resolve(null)),
    hdel: jest.fn(() => Promise.resolve(1)),
    hgetall: jest.fn(() => Promise.resolve({})),
    sadd: jest.fn(() => Promise.resolve(1)),
    srem: jest.fn(() => Promise.resolve(1)),
    smembers: jest.fn(() => Promise.resolve([])),
    scard: jest.fn(() => Promise.resolve(0)),
  },
}));
jest.mock("../config/firebase", () => ({
  __esModule: true,
  default: { auth: jest.fn() },
}));

import User from "../models/userModel";
import userRouter from "../routers/userRouter";
import {
  blockUserByUsername,
  unblockUserByUsername,
} from "../services/userService";

const JWT_SECRET = "test-secret-unblock";
process.env.jwt_Secret = JWT_SECRET;

let mongo: MongoMemoryServer;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);

const sign = (u: any) =>
  jwt.sign({ username: u.username, email: u.email, id: u._id }, JWT_SECRET);
const auth = (u: any) => `token=${sign(u)}`;

async function makeUser(username: string) {
  return User.create({
    username,
    email: `${username}@example.com`,
    password: "password123",
  });
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 120000);

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("unblockUserByUsername service", () => {
  test("removes only the targeted user; already-unblocked is a no-op success", async () => {
    const me = await makeUser("UnblockerApi");
    const u1 = await makeUser("UnblockedApi1");
    const u2 = await makeUser("UnblockedApi2");

    expect((await blockUserByUsername("UnblockedApi1", me._id.toString())).code).toBe(200);
    expect((await blockUserByUsername("UnblockedApi2", me._id.toString())).code).toBe(200);

    expect((await unblockUserByUsername("UnblockedApi1", me._id.toString())).code).toBe(200);
    expect((await unblockUserByUsername("UnblockedApi1", me._id.toString())).code).toBe(200);

    const fresh = await User.findById(me._id);
    const ids = fresh!.blockedUsers!.map(String);
    expect(ids).toContain(String(u2._id));
    expect(ids).not.toContain(String(u1._id));
  });

  test("unknown user to unblock returns 404", async () => {
    const me = await makeUser("UnblockerGhost");
    const res = await unblockUserByUsername("Ghost", me._id.toString());
    expect(res.code).toBe(404);
  });
});

describe("unblock HTTP surface", () => {
  test("POST /user/unblockUser/:username clears the block", async () => {
    const me = await makeUser("UnblkHttpMe");
    const peer = await makeUser("UnblkHttpPeer");

    await blockUserByUsername(peer.username, me._id.toString());

    const res = await request(app)
      .post(`/user/unblockUser/${peer.username}`)
      .set("Cookie", auth(me));

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(200);

    const fresh = await User.findById(me._id);
    expect(fresh!.blockedUsers!.map(String)).not.toContain(String(peer._id));
  });

  test("GET /user/profile/:username reports isBlockedByMe true while blocked, false after unblock", async () => {
    const me = await makeUser("UnblkProfMe");
    const peer = await makeUser("UnblkProfPeer");

    await blockUserByUsername(peer.username, me._id.toString());

    const blockedRes = await request(app)
      .get(`/user/profile/${peer.username}`)
      .set("Cookie", auth(me));
    expect(blockedRes.statusCode).toBe(200);
    expect(blockedRes.body.data.user.isBlockedByMe).toBe(true);

    await unblockUserByUsername(peer.username, me._id.toString());

    const unblockedRes = await request(app)
      .get(`/user/profile/${peer.username}`)
      .set("Cookie", auth(me));
    expect(unblockedRes.body.data.user.isBlockedByMe).toBe(false);
  });

  test("unauthenticated unblock is rejected with 401", async () => {
    const res = await request(app).post("/user/unblockUser/someone");
    expect(res.statusCode).toBe(401);
  });
});