// Regression test for issue #10: login must set httpOnly/Secure/SameSite=None
// cookies and must not return the token in the JSON body.
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("../utils/redis", () => ({
  __esModule: true,
  default: { hset: jest.fn(), hget: jest.fn(), hdel: jest.fn(), hgetall: jest.fn() },
}));

import userRouter from "../routers/userRouter";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.jwt_Secret = process.env.jwt_Secret || "test-secret";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await request(app).post("/user/create").send({
    username: "CookieUser",
    email: "cookie@example.com",
    password: "password123",
  });
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

function cookiesOf(res: request.Response): string[] {
  return (res.headers["set-cookie"] as unknown as string[]) ?? [];
}

test("login sets flagged cookies and omits token from body", async () => {
  const res = await request(app)
    .post("/user/login")
    .send({ username: "CookieUser", password: "password123" });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeUndefined();
  expect(res.body.status).toBe("success");

  const cookies = cookiesOf(res);
  const token = cookies.find((c) => c.startsWith("token="));
  const refresh = cookies.find((c) => c.startsWith("refreshtoken="));
  expect(token).toBeTruthy();
  expect(refresh).toBeTruthy();
  for (const c of [token!, refresh!]) {
    expect(c).toMatch(/HttpOnly/i);
    expect(c).toMatch(/Secure/i);
    expect(c).toMatch(/SameSite=None/i);
  }
});

test("cookie auth works and logout clears both cookies", async () => {
  const login = await request(app)
    .post("/user/login")
    .send({ username: "CookieUser", password: "password123" });
  const jar = cookiesOf(login).map((c) => c.split(";")[0]).join("; ");

  const me = await request(app).get("/user/userInfo").set("Cookie", jar);
  expect(me.statusCode).toBe(200);

  const logout = await request(app).get("/user/logout").set("Cookie", jar);
  expect(logout.statusCode).toBe(200);
  const cleared = cookiesOf(logout);
  expect(cleared.find((c) => c.startsWith("token="))).toMatch(/Expires=Thu, 01 Jan 1970/i);
  expect(cleared.find((c) => c.startsWith("refreshtoken="))).toMatch(/Expires=Thu, 01 Jan 1970/i);
});
