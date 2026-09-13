import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import jwt from "jsonwebtoken";

// ponytail: factory mock so the real ioredis client is never constructed
// (automock executed src/utils/redis.ts, whose retry timers kept jest alive).
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
    srem: jest.fn(() => Promise.resolve(1)),
    smembers: jest.fn((k: string) => Promise.resolve([...(socketSets.get(k) ?? [])])),
    scard: jest.fn((k: string) => Promise.resolve(socketSets.get(k)?.size ?? 0)),
  },
}));
jest.mock("../models/userModel");
jest.mock("../models/groupModel");

import redis from "../utils/redis";
import User from "../models/userModel";
import Group from "../models/groupModel";

const JWT_SECRET = "test-secret-socket";
process.env.jwt_Secret = JWT_SECRET;

let io: Server;
let httpServer: any;
let clientSocket: any;
let port: number;

// ponytail: poll instead of fixed sleeps — fast when ready, no flakes when slow
const waitFor = async (cond: () => boolean, ms = 2000) => {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error("timed out waiting for condition");
    await new Promise((r) => setTimeout(r, 25));
  }
};

beforeAll(async () => {
    httpServer = createServer();
    io = new Server(httpServer);

    const socketHandler = require("../socket").default;
    socketHandler(io);

    await new Promise<void>((res) => httpServer.listen(() => res()));
    port = (httpServer.address() as any).port;

    const fakeUser = {
        _id: "123",
        username: "ck",
        contacts: [],
    };
    (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeUser),
    });

    (Group.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue([
            { _id: "g1", name: "Group1" },
            { _id: "g2", name: "Group2" }
        ])
    });

    const token = jwt.sign({ username: "ck", email: "ck@example.com", id: "123" }, JWT_SECRET);
    clientSocket = Client(`http://localhost:${port}`, {
        transports: ["websocket"],
        extraHeaders: { cookie: `token=${token}` },
    });
    await new Promise<void>((res, rej) => {
        clientSocket.on("connect", () => res());
        clientSocket.on("connect_error", (e: Error) => rej(e));
    });
});


afterAll(async () => {
    clientSocket?.disconnect();
    await new Promise<void>((res) => io.close(() => res()));
    await new Promise<void>((res) => httpServer.close(() => res()));
});

test("connect should store to redis + join groups + notify contacts", async () => {
    await waitFor(() => (redis.hset as jest.Mock).mock.calls.some(
        ([k, f]) => k === "onlineUsers" && f === "ck"
    ));

    expect(redis.hset).toHaveBeenCalledWith("onlineUsers", "ck", expect.any(String));
    expect(redis.hset).toHaveBeenCalledWith("socketToUsername", expect.any(String), "ck");
    expect(User.findById).toHaveBeenCalledWith("123");
    expect(Group.find).toHaveBeenCalledWith({ users: "123" });
});
