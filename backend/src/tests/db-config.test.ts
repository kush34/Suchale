// Regression tests for issue #12:
// 1) connectDB must throw on failure (fail fast, never serve without a DB).
// 2) app, compose, and sample must agree on the MONGO_URI key.
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import connectDB from "../config/database";

const OLD_ENV = { ...process.env };

afterEach(async () => {
  process.env = { ...OLD_ENV };
  await mongoose.disconnect().catch(() => undefined);
});

test("throws when no URI is configured", async () => {
  delete process.env.MONGO_URI;
  process.env.NODE_ENV = "prod";
  await expect(connectDB()).rejects.toThrow(/MONGO_URI is missing/);
});

test("throws when the host is unreachable (fail fast)", async () => {
  process.env.NODE_ENV = "prod";
  process.env.MONGO_URI =
    "mongodb://127.0.0.1:9/db?serverSelectionTimeoutMS=1000&connectTimeoutMS=1000";
  await expect(connectDB()).rejects.toThrow();
}, 30000);

test("connects with the test URI", async () => {
  const mongo = await MongoMemoryServer.create();
  try {
    process.env.NODE_ENV = "test";
    process.env.MONGO_URI_TEST = mongo.getUri();
    await expect(connectDB()).resolves.toBeUndefined();
    expect(mongoose.connection.readyState).toBe(1);
  } finally {
    await mongo.stop();
  }
}, 120000);

test("compose and sample use the same MONGO_URI key the app reads", () => {
  const backend = path.resolve(__dirname, "../..");
  const compose = fs.readFileSync(path.join(backend, "docker-compose.yml"), "utf8");
  const sample = fs.readFileSync(path.join(backend, ".env.sample"), "utf8");
  expect(compose).toMatch(/MONGO_URI:/);
  expect(compose).not.toMatch(/MongoDb_URI/);
  expect(sample).toMatch(/^MONGO_URI=/m);
  expect(sample).not.toMatch(/MongoDb_URI/);
});
