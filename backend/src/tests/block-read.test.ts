// Regression tests for issue #11:
// 1) blockUserByUsername must append, not overwrite blockedUsers.
// 2) socket readMessages must mark messages read (schema: fromUser/toUser usernames).
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const presence = new Map<string, string>();
const socketSets = new Map<string, Set<string>>();
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
    sadd: jest.fn((k: string, ...members: string[]) => {
      let set = socketSets.get(k);
      if (!set) {
        set = new Set();
        socketSets.set(k, set);
      }
      let added = 0;
      for (const m of members) {
        if (!set.has(m)) {
          set.add(m);
          added += 1;
        }
      }
      return Promise.resolve(added);
    }),
    srem: jest.fn((k: string, ...members: string[]) => {
      const set = socketSets.get(k);
      if (!set) return Promise.resolve(0);
      let removed = 0;
      for (const m of members) {
        if (set.delete(m)) removed += 1;
      }
      return Promise.resolve(removed);
    }),
    smembers: jest.fn((k: string) => Promise.resolve([...(socketSets.get(k) ?? [])])),
    scard: jest.fn((k: string) => Promise.resolve(socketSets.get(k)?.size ?? 0)),
  },
}));

import User from "../models/userModel";
import Message from "../models/messageModel";
import { blockUserByUsername } from "../services/userService";

const JWT_SECRET = "test-secret-11";
process.env.jwt_Secret = JWT_SECRET;

let mongo: MongoMemoryServer;
let io: Server;
let httpServer: any;
let port: number;

const sign = (u: any) =>
  jwt.sign({ username: u.username, email: u.email, id: u._id }, JWT_SECRET);
const connectClient = (token: string) =>
  Client(`http://localhost:${port}`, {
    transports: ["websocket"],
    extraHeaders: { cookie: `token=${token}` },
  });
const awaitConnect = (c: any) =>
  new Promise<void>((res, rej) => {
    c.on("connect", () => res());
    c.on("connect_error", (e: Error) => rej(e));
  });

// ponytail: poll instead of fixed sleeps — fast when ready, no flakes when slow
const waitFor = async (cond: () => Promise<boolean> | boolean, ms = 5000) => {
  const start = Date.now();
  while (!(await cond())) {
    if (Date.now() - start > ms) throw new Error("timed out waiting for condition");
    await new Promise((r) => setTimeout(r, 25));
  }
};

const clients: any[] = [];
const track = (c: any) => {
  clients.push(c);
  return c;
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  httpServer = createServer();
  io = new Server(httpServer);
  require("../socket").default(io);
  await new Promise<void>((res) => httpServer.listen(() => res()));
  port = (httpServer.address() as any).port;
}, 120000);

afterEach(async () => {
  await User.deleteMany({});
  await Message.deleteMany({});
  presence.clear();
  socketSets.clear();
});

afterAll(async () => {
  for (const c of clients) c.disconnect?.();
  await new Promise<void>((res) => io.close(() => res()));
  await new Promise<void>((res) => httpServer.close(() => res()));
  await mongoose.disconnect();
  await mongo.stop();
});

async function makeUser(username: string) {
  return User.create({
    username,
    email: `${username}@example.com`,
    password: "password123",
  });
}

test("blocking twice keeps both users, re-block does not duplicate", async () => {
  const me = await makeUser("Blocker");
  const u1 = await makeUser("Blocked1");
  const u2 = await makeUser("Blocked2");

  expect((await blockUserByUsername("Blocked1", me._id.toString())).code).toBe(200);
  expect((await blockUserByUsername("Blocked2", me._id.toString())).code).toBe(200);
  expect((await blockUserByUsername("Blocked1", me._id.toString())).code).toBe(200);

  const fresh = await User.findById(me._id);
  const ids = fresh!.blockedUsers!.map(String);
  expect(ids).toContain(String(u1._id));
  expect(ids).toContain(String(u2._id));
  expect(ids.length).toBe(2);
});

test("readMessages marks peer messages read and notifies the sender", async () => {
  const alice = await makeUser("Alice11");
  const bob = await makeUser("Bob11");

  await Message.create({ fromUser: bob.username, toUser: alice.username, content: "hi" });
  await Message.create({ fromUser: alice.username, toUser: bob.username, content: "yo" });

  const sockA = track(connectClient(sign(alice)));
  const sockB = track(connectClient(sign(bob)));
  await Promise.all([awaitConnect(sockA), awaitConnect(sockB)]);

  const seen: any[] = [];
  sockB.on("messagesReadBy", (p) => seen.push(p));
  sockA.emit("readMessages", { fromUser: bob.username });
  await waitFor(async () =>
    seen.length > 0 &&
    (await Message.countDocuments({ fromUser: bob.username, read: true })) === 1
  );

  // Bob->Alice now read; Alice->Bob untouched
  expect(await Message.countDocuments({ fromUser: bob.username, read: true })).toBe(1);
  expect(await Message.countDocuments({ fromUser: alice.username, read: false })).toBe(1);
  expect(seen).toEqual([{ byUser: alice.username }]);

  sockA.close();
  sockB.close();
}, 30000);
