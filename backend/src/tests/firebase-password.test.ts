// Regression test for issue #9: Firebase auto-provision must not store a
// plaintext, password-loginable credential.
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const mockVerifyIdToken = jest.fn();

jest.mock("../config/firebase", () => ({
  __esModule: true,
  default: { auth: () => ({ verifyIdToken: mockVerifyIdToken }) },
}));

jest.mock("../utils/redis", () => ({
  __esModule: true,
  default: { hset: jest.fn(), hget: jest.fn(), hdel: jest.fn(), hgetall: jest.fn() },
}));

import User from "../models/userModel";
import { firebaseTokenVerify, loginUser } from "../services/userService";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.jwt_Secret = process.env.jwt_Secret || "test-secret";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 120000);

afterEach(async () => {
  await User.deleteMany({});
  mockVerifyIdToken.mockReset();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("firebase first-login stores a bcrypt hash, not a loginable plaintext", async () => {
  mockVerifyIdToken.mockResolvedValue({
    email: "firebase-user@example.com",
    name: "Firebase User",
    picture: undefined,
  });

  const res = await firebaseTokenVerify("fake-google-token");
  expect(res.status).toBe("success");

  const dbUser = await User.findOne({ email: "firebase-user@example.com" });
  expect(dbUser).not.toBeNull();
  // bcrypt hash format, never a short Math.random() string
  expect(dbUser!.password).toMatch(/^\$2[aby]\$\d{2}\$/);
  expect(dbUser!.password.length).toBeGreaterThan(50);
});

test("firebase-provisioned user cannot log in via /login password path", async () => {
  mockVerifyIdToken.mockResolvedValue({
    email: "firebase-user@example.com",
    name: "Firebase User",
    picture: undefined,
  });

  await firebaseTokenVerify("fake-google-token");
  const dbUser = await User.findOne({ email: "firebase-user@example.com" });

  // No attacker-guessable password verifies against the stored hash
  for (const guess of ["password", "password123", dbUser!.username, "firebase"]) {
    expect(await bcrypt.compare(guess, dbUser!.password)).toBe(false);
  }

  const login = await loginUser({ username: dbUser!.username, password: "password123" });
  expect(login.status).toBe("error");
  expect(login.code).toBe(401);
});

test("returning firebase user gets tokens without creating a duplicate", async () => {
  mockVerifyIdToken.mockResolvedValue({
    email: "firebase-user@example.com",
    name: "Firebase User",
    picture: undefined,
  });

  await firebaseTokenVerify("first");
  const second = await firebaseTokenVerify("second");
  expect(second.status).toBe("success");
  expect(second.token).toBeTruthy();
  expect(await User.countDocuments({ email: "firebase-user@example.com" })).toBe(1);
});
