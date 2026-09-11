// Regression tests for issue #14: conversation authorization.
// DM rule: peer must exist, neither side may have blocked the other.
// Group rule: requester must be a member. Call rule: only parties may
// ring/answer/end/inject into a call.
import { createServer } from "http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
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
jest.mock("../utils/webpush", () => ({
  __esModule: true,
  default: { sendNotification: jest.fn() },
}));
// messageService imports { io } from ../index; stub it so tests never boot
// the real server module (which would circular-import the router under test).
jest.mock("../index", () => ({
  __esModule: true,
  io: { to: () => ({ emit: jest.fn() }), sockets: { sockets: new Map() } },
  default: { listen: jest.fn() },
}));

import User from "../models/userModel";
import Message from "../models/messageModel";
import Group from "../models/groupModel";
import Call from "../models/callModel";
import messageRouter from "../routers/messageRouter";
import {
  sendMessage,
  getMessagesService,
  reactToMsg,
  sendMediaService,
  getChatAssets,
  createGroupService,
  getMembersByGroupIdService,
} from "../services/messageService";

const JWT_SECRET = "test-secret-14";
process.env.jwt_Secret = JWT_SECRET;

let mongo: MongoMemoryServer;
let io: Server;
let httpServer: any;
let port: number;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/message", messageRouter);

const sign = (u: any) =>
  jwt.sign({ username: u.username, email: u.email, id: u._id }, JWT_SECRET);
const auth = (u: any) => `token=${sign(u)}`;
const connectClient = (u: any) =>
  Client(`http://localhost:${port}`, {
    transports: ["websocket"],
    extraHeaders: { cookie: auth(u) },
  });
const awaitConnect = (c: any) =>
  new Promise<void>((res, rej) => {
    c.on("connect", () => res());
    c.on("connect_error", (e: Error) => rej(e));
  });
const once = (c: any, ev: string, ms = 2000) =>
  new Promise<any>((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timed out waiting for ${ev}`)), ms);
    c.once(ev, (p: any) => {
      clearTimeout(t);
      res(p);
    });
  });

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
  await Promise.all([User.deleteMany({}), Message.deleteMany({}), Group.deleteMany({}), Call.deleteMany({})]);
  presence.clear();
  socketSets.clear();
});

afterAll(async () => {
  io.close();
  httpServer.close();
  await mongoose.disconnect();
  await mongo.stop();
});

async function makeUser(username: string) {
  return User.create({ username, email: `${username}@ex.com`, password: "password123" });
}
async function makeGroup(name: string, admin: any, members: any[] = []) {
  const group = await Group.create({
    name,
    admin: admin._id,
    users: [admin._id, ...members.map((m) => m._id)],
  });
  await User.updateMany(
    { _id: { $in: [admin._id, ...members.map((m) => m._id)] } },
    { $addToSet: { groups: group._id } }
  );
  return group;
}

describe("DM guards", () => {
  test("sendMessage to unknown user throws", async () => {
    const a = await makeUser("DmA");
    await expect(sendMessage({ fromUser: a.username, toUser: "Ghost", type: "text", content: "hi" } as any)).rejects.toThrow(
      /User not found/
    );
  });

  test("sendMessage past a block throws Forbidden", async () => {
    const a = await makeUser("DmBlockA");
    const b = await makeUser("DmBlockB");
    await User.findByIdAndUpdate(b._id, { $addToSet: { blockedUsers: b._id } });
    await User.findByIdAndUpdate(b._id, { $addToSet: { blockedUsers: a._id } });
    await expect(
      sendMessage({ fromUser: a.username, toUser: b.username, type: "text", content: "hi" } as any)
    ).rejects.toThrow(/Forbidden/);
  });

  test("sendMediaService past a block throws Forbidden", async () => {
    const a = await makeUser("MedA");
    const b = await makeUser("MedB");
    await User.findByIdAndUpdate(a._id, { $addToSet: { blockedUsers: b._id } });
    await expect(sendMediaService(a.username, b.username, "https://x/y.png")).rejects.toThrow(/Forbidden/);
  });

  test("stranger cannot pull someone else's DM history", async () => {
    const a = await makeUser("HistA");
    const b = await makeUser("HistB");
    const c = await makeUser("HistC");
    await Message.create({ fromUser: a.username, toUser: b.username, content: "secret" });
    const res = await getMessagesService({ username: c.username, toUser: a.username, isGroup: false });
    expect(res.messages.map((m) => m.content)).not.toContain("secret");
  });

  test("outsider reaction on a DM returns 403", async () => {
    const a = await makeUser("ReactA");
    const b = await makeUser("ReactB");
    const c = await makeUser("ReactC");
    const msg = await Message.create({ fromUser: a.username, toUser: b.username, content: "hi" });
    const res = await reactToMsg(c.username, msg.id, "👍");
    expect(res.code).toBe(403);
  });
});

describe("group guards", () => {
  test("non-member sendMessage to group throws Forbidden", async () => {
    const admin = await makeUser("GrpAdmin");
    const outsider = await makeUser("GrpOut");
    const group = await makeGroup("g1", admin);
    await expect(
      sendMessage({ fromUser: outsider.username, groupId: group._id.toString(), isGroup: true, type: "text", content: "hi" } as any)
    ).rejects.toThrow(/Forbidden/);
  });

  test("non-member getMessages on group throws Forbidden", async () => {
    const admin = await makeUser("GrpAdmin2");
    const outsider = await makeUser("GrpOut2");
    const group = await makeGroup("g2", admin);
    await expect(
      getMessagesService({ username: outsider.username, groupId: group._id.toString(), isGroup: true })
    ).rejects.toThrow(/Forbidden/);
  });

  test("non-member getChatAssets on group throws Forbidden", async () => {
    const admin = await makeUser("GrpAdmin3");
    const outsider = await makeUser("GrpOut3");
    const group = await makeGroup("g3", admin);
    await expect(getChatAssets(outsider.username, { groupId: group._id.toString() })).rejects.toThrow(/Forbidden/);
  });

  test("non-member getMembers throws not-member", async () => {
    const admin = await makeUser("GrpAdmin4");
    const outsider = await makeUser("GrpOut4");
    const group = await makeGroup("g4", admin);
    await expect(getMembersByGroupIdService(outsider.username, group._id.toString())).rejects.toThrow(/not member/);
  });

  test("non-member reaction on group message returns 403", async () => {
    const admin = await makeUser("GrpAdmin5");
    const outsider = await makeUser("GrpOut5");
    const group = await makeGroup("g5", admin);
    const msg = await Message.create({ fromUser: admin.username, groupId: group._id, content: "hi" });
    const res = await reactToMsg(outsider.username, msg.id, "👍");
    expect(res.code).toBe(403);
  });

  test("createGroup rejects unknown member ids", async () => {
    const admin = await makeUser("GrpAdmin6");
    await expect(
      createGroupService({ name: "x", users: [new mongoose.Types.ObjectId().toString()], adminId: admin._id.toString() })
    ).rejects.toThrow(/Unknown user/);
  });

  test("member happy path still works", async () => {
    const admin = await makeUser("GrpAdmin7");
    const member = await makeUser("GrpMem7");
    const group = await makeGroup("g7", admin, [member]);
    const msg = await sendMessage({
      fromUser: member.username, groupId: group._id.toString(), isGroup: true, type: "text", content: "hello",
    } as any);
    expect(msg.content).toBe("hello");
    const fetched = await getMessagesService({ username: admin.username, groupId: group._id.toString(), isGroup: true });
    expect(fetched.messages.map((m) => m.content)).toContain("hello");
  });
});

describe("HTTP status mapping", () => {
  test("POST /message/send past a block returns 403, not 500", async () => {
    const a = await makeUser("HttpA");
    const b = await makeUser("HttpB");
    await User.findByIdAndUpdate(b._id, { $addToSet: { blockedUsers: a._id } });
    const res = await request(app)
      .post("/message/send")
      .set("Cookie", auth(a))
      .send({ toUser: b.username, content: "hi" });
    expect(res.statusCode).toBe(403);
  });

  test("POST /message/getMessages as group outsider returns 403", async () => {
    const admin = await makeUser("HttpAdm");
    const outsider = await makeUser("HttpOut");
    const group = await makeGroup("hg", admin);
    const res = await request(app)
      .post("/message/getMessages")
      .set("Cookie", auth(outsider))
      .send({ groupId: group._id.toString(), isGroup: true });
    expect(res.statusCode).toBe(403);
  });
});

describe("call guards over sockets", () => {
  test("legit ring -> answer -> end flows, stranger cannot end or inject", async () => {
    const a = await makeUser("CallA");
    const b = await makeUser("CallB");
    const c = await makeUser("CallC");
    const sockA = connectClient(a);
    const sockB = connectClient(b);
    const sockC = connectClient(c);
    try {
      await Promise.all([awaitConnect(sockA), awaitConnect(sockB), awaitConnect(sockC)]);

      sockA.emit("initiateCall", { to: b.username, type: "audio" });
      const incoming = await once(sockB, "incomingCall");
      expect(incoming.from).toBe(a.username);
      const callId = incoming.callId as string;

      // stranger tries to end the call: doc untouched, nobody notified
      const endSpy: any[] = [];
      sockB.on("callEnded", (p) => endSpy.push(p));
      sockC.emit("endCall", { callId, to: b.username });
      await new Promise((r) => setTimeout(r, 800));
      expect(await Call.findById(callId).then((d) => d!.endedAt)).toBeUndefined();
      expect(endSpy).toEqual([]);

      // stranger tries to inject an offer: nothing relayed
      const offerSpy: any[] = [];
      sockB.on("receiveOffer", (p) => offerSpy.push(p));
      sockC.emit("sendOffer", { to: b.username, callId, offer: { evil: true } });
      await new Promise((r) => setTimeout(r, 800));
      expect(offerSpy).toEqual([]);

      // legit answer + end
      sockB.emit("answerCall", { from: a.username, callId });
      const answered = await once(sockA, "callAnswered");
      expect(answered.callId).toBe(callId);

      sockA.emit("endCall", { callId, to: b.username });
      const ended = await once(sockB, "callEnded");
      expect(ended.callId).toBe(callId);
      const doc = await Call.findById(callId);
      expect(doc!.endedAt).toBeTruthy();
    } finally {
      sockA.close();
      sockB.close();
      sockC.close();
    }
  }, 30000);

  test("initiateCall to unknown user rings nobody", async () => {
    const a = await makeUser("CallA2");
    const sockA = connectClient(a);
    try {
      await awaitConnect(sockA);
      sockA.emit("initiateCall", { to: "NobodyHere", type: "audio" });
      await new Promise((r) => setTimeout(r, 800));
      expect(await Call.countDocuments({})).toBe(0);
    } finally {
      sockA.close();
    }
  }, 30000);

  test("initiateCall past a block does not ring", async () => {
    const a = await makeUser("CallA3");
    const b = await makeUser("CallB3");
    await User.findByIdAndUpdate(b._id, { $addToSet: { blockedUsers: a._id } });
    const sockA = connectClient(a);
    const sockB = connectClient(b);
    try {
      await Promise.all([awaitConnect(sockA), awaitConnect(sockB)]);
      const rings: any[] = [];
      sockB.on("incomingCall", (p) => rings.push(p));
      sockA.emit("initiateCall", { to: b.username, type: "audio" });
      await new Promise((r) => setTimeout(r, 800));
      expect(rings).toEqual([]);
      expect(await Call.countDocuments({})).toBe(0);
    } finally {
      sockA.close();
      sockB.close();
    }
  }, 30000);
});
