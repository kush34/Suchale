import { Server, Socket } from "socket.io";
import Group from "./models/groupModel";
import Message from "./models/messageModel";
import User from "./models/userModel";
import Call from "./models/callModel";
import redis from "./utils/redis";
import { verifySocketToken } from "./middlewares/verifyToken";

/* ================= TYPES ================= */

interface SocketData {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

type AuthenticatedSocket = Socket<any, any, any, SocketData>;

/* ================= HELPERS ================= */

const getSocketIdByUsername = (username: string) =>
  redis.hget("onlineUsers", username);

/* ================= CALL HANDLERS ================= */

// ponytail: call participant checks (issue #14) — a stranger must not be able
// to ring, answer, end, or inject SDP into someone else's call.
const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id || "");

const isBlocked = (list: any, id: any) =>
  (list || []).some((u: any) => u.toString() === id.toString());

const callParties = async (callId: string, meId: string, peerUsername: string) => {
  if (!isObjectId(callId)) return null;
  const [call, peer] = await Promise.all([
    Call.findById(callId),
    User.findOne({ username: peerUsername }).select("_id"),
  ]);
  if (!call || !peer) return null;
  const ids = [call.user_id.toString(), call.to_user_id.toString()];
  if (!ids.includes(meId.toString()) || !ids.includes(peer._id.toString())) return null;
  return call;
};

const handleInitiateCall = async (
  socket: AuthenticatedSocket,
  { to, type }: { to: string; type: "audio" | "video" }
) => {
  const recipientSocketId = await getSocketIdByUsername(to);
  if (!recipientSocketId) return;

  const toUser = await User.findOne({ username: to });
  if (!toUser) return;

  const fromUser = await User.findById(socket.data.user.id).select("blockedUsers");
  if (!fromUser || isBlocked(fromUser.blockedUsers, toUser._id) || isBlocked(toUser.blockedUsers, fromUser._id)) return;

  const call = await Call.create({
    user_id: socket.data.user.id,
    to_user_id: toUser._id,
    type,
  });

  socket.to(recipientSocketId).emit("incomingCall", {
    from: socket.data.user.username,
    callId: call._id,
    type,
  });
};

const handleAnswerCall = async (
  socket: AuthenticatedSocket,
  { from, callId }: { from: string; callId: string }
) => {
  if (!(await callParties(callId, socket.data.user.id, from))) return;
  await Call.findByIdAndUpdate(callId, { pickedAt: new Date() });

  const recipientSocketId = await getSocketIdByUsername(from);
  if (!recipientSocketId) return;

  socket.to(recipientSocketId).emit("callAnswered", {
    from: socket.data.user.username,
    callId,
  });
};

const handleEndCall = async (
  socket: AuthenticatedSocket,
  { callId, to }: { callId: string; to: string }
) => {
  const call = await callParties(callId, socket.data.user.id, to);
  if (!call) return;

  const endedAt = new Date();
  const startTime = call.pickedAt ?? call.createdAt;
  const duration = Math.floor(
    (endedAt.getTime() - startTime.getTime()) / 1000
  );

  await Call.findByIdAndUpdate(callId, {
    endedAt,
    duration,
  });

  const recipientSocketId = await getSocketIdByUsername(to);
  if (recipientSocketId) {
    socket.to(recipientSocketId).emit("callEnded", { callId });
  }
};

const handleSendOffer = async (
  socket: AuthenticatedSocket,
  { to, callId, offer }: any
) => {
  if (!(await callParties(callId, socket.data.user.id, to))) return;
  const recipientSocketId = await getSocketIdByUsername(to);
  if (!recipientSocketId) return;

  socket.to(recipientSocketId).emit("receiveOffer", {
    from: socket.data.user.username,
    callId,
    offer,
  });
};

const handleSendAnswer = async (
  socket: AuthenticatedSocket,
  { to, callId, answer }: any
) => {
  if (!(await callParties(callId, socket.data.user.id, to))) return;
  const recipientSocketId = await getSocketIdByUsername(to);
  if (!recipientSocketId) return;

  socket.to(recipientSocketId).emit("receiveAnswer", {
    from: socket.data.user.username,
    callId,
    answer,
  });
};

const handleSendCandidate = async (
  socket: AuthenticatedSocket,
  { to, callId, candidate }: any
) => {
  if (!(await callParties(callId, socket.data.user.id, to))) return;
  const recipientSocketId = await getSocketIdByUsername(to);
  if (!recipientSocketId) return;

  socket.to(recipientSocketId).emit("receiveCandidate", {
    from: socket.data.user.username,
    callId,
    candidate,
  });
};

/* ================= MAIN SOCKET ================= */

export default function socketHandler(io: Server) {
  io.use(verifySocketToken);

  io.on("connection", async (socket: AuthenticatedSocket) => {
    const { id: userId, username } = socket.data.user;

    console.log(`⚡ User connected: ${username}`);

    /* ===== ONLINE STATE ===== */
    await redis.hset("onlineUsers", username, socket.id);
    await redis.hset("socketToUsername", socket.id, username);

    const dbUser = await User.findById(userId).populate("contacts");
    if (dbUser) {
      const groups = await Group.find({ users: userId }).select("_id name");
      groups.forEach(group => socket.join(group._id.toString()));

      for (const contact of dbUser.contacts as any) {
        const contactSocketId = await getSocketIdByUsername(contact.username);
        if (contactSocketId) {
          io.to(contactSocketId).emit("friendOnline", username);
        }
      }
    }

    /* ===== CHAT EVENTS ===== */

    socket.on("typing", async ({ to }) => {
      const id = await getSocketIdByUsername(to);
      if (id) io.to(id).emit("typing", { from: username });
    });

    socket.on("stopTyping", async ({ to }) => {
      const id = await getSocketIdByUsername(to);
      if (id) io.to(id).emit("stopTyping", { from: username });
    });

    socket.on("sendGroupMessage", async ({ groupId, content }) => {
      if (!groupId || !/^[0-9a-fA-F]{24}$/.test(groupId) || !content?.trim()) return;
      // ponytail: membership check (issue #14) — Group already imported here
      const group = await Group.findById(groupId).select("users");
      if (!group || !group.users.some((u) => u.toString() === userId.toString())) return;

      const message = await Message.create({
        sender: userId,
        content,
        chat: groupId,
      });

      await Group.findByIdAndUpdate(groupId, {
        $push: { messages: message._id },
      });

      io.to(groupId).emit("newGroupMessage", { groupId, message });
    });

    socket.on("readMessages", async ({ fromUser }) => {
      // ponytail: schema fields are fromUser/toUser (usernames), same as getMessagesService
      await Message.updateMany(
        { fromUser, toUser: username, read: false },
        { $set: { read: true } }
      );

      const fromSocketId = await getSocketIdByUsername(fromUser);
      if (fromSocketId) {
        io.to(fromSocketId).emit("messagesReadBy", { byUser: username });
      }
    });

    /* ===== CALL EVENTS (SINGLE SOURCE OF TRUTH) ===== */

    socket.on("initiateCall", data =>
      handleInitiateCall(socket, data)
    );
    socket.on("answerCall", data =>
      handleAnswerCall(socket, data)
    );
    socket.on("endCall", data =>
      handleEndCall(socket, data)
    );
    socket.on("sendOffer", data =>
      handleSendOffer(socket, data)
    );
    socket.on("sendAnswer", data =>
      handleSendAnswer(socket, data)
    );
    socket.on("sendCandidate", data =>
      handleSendCandidate(socket, data)
    );

    /* ===== DISCONNECT ===== */

    socket.on("disconnect", async () => {
      console.log(`❌ Disconnected: ${username}`);

      await redis.hdel("onlineUsers", username);
      await redis.hdel("socketToUsername", socket.id);

      if (!dbUser) return;

      for (const contact of dbUser.contacts as any) {
        const id = await getSocketIdByUsername(contact.username);
        if (id) io.to(id).emit("friendOffline", username);
      }
    });
  });
}
