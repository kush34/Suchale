import express, { urlencoded } from "express";
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config'
import connectDB from "./config/database.js";
import userRouter from "./routers/userRouter.js";
import messageRouter from "./routers/messageRouter.js";

import cors from 'cors';
import User from "./models/userModel.js";
import Message from "./models/messageModel.js";
import Group from "./models/groupModel.js";
import redis from "./utils/redis.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.Frontend_URL,
    credentials: true,
  },
});

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: `${process.env.Frontend_URL}`,
    credentials: true,
  })
);


app.use('/user', userRouter);
app.use('/message', messageRouter);
app.get("/", (req, res) => res.send("Hello World!"));


io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('addUser', async (userId) => {
    socket.userId = userId;

    await redis.hset('onlineUsers', userId, socket.id);
    await redis.hset('socketToUsername', socket.id, userId);

    const dbUser = await User.findOne({ username: userId });
    if (!dbUser) return;

    const groups = await Group.find({ users: dbUser._id }).select("_id name");
    groups.forEach((group) => {
      socket.join(group._id.toString());
      console.log(`User: ${userId} joined group ${group.name} ${group._id}`);
    });

    const contacts = dbUser.contacts;

    for (const contactId of contacts) {
      const contactUser = await User.findById(contactId);
      if (!contactUser) continue;

      const contactSocketId = await redis.hget('onlineUsers', contactUser.username);
      if (contactSocketId) {
        io.to(contactSocketId).emit('friendOnline', userId);
        console.log(`Emitting friendOnline to ${contactUser.username}`);
      }
    }
  });

  socket.on("typing", async ({ to }) => {
    const recipientSocketId = await redis.hget('onlineUsers', to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { from: socket.userId });
    }
  });

  socket.on("stopTyping", async ({ to }) => {
    const recipientSocketId = await redis.hget('onlineUsers', to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stopTyping", { from: socket.userId });
    }
  });

  socket.on("sendGroupMessage", async ({ groupId, content }) => {
    const message = await Message.create({
      sender: socket.userId,
      content,
      chat: groupId,
    });

    await Group.findByIdAndUpdate(groupId, { $push: { messages: message._id } });
    io.to(groupId).emit("newGroupMessage", { groupId, message });
  });

  socket.on("readMessages", async ({ fromUser, toUser }) => {
    await Message.updateMany(
      { from: fromUser, to: toUser, read: false },
      { $set: { read: true } }
    );
    const fromSocketId = await redis.hget('onlineUsers', fromUser);
    if (fromSocketId) io.to(fromSocketId).emit("messagesReadBy", { toUser });
  });

  socket.on('disconnect', async () => {
    const username = await redis.hget('socketToUsername', socket.id);
    console.log('Disconnected user:', username);

    if (username) {
      await redis.hdel('onlineUsers', username);
      await redis.hdel('socketToUsername', socket.id);

      const dbUser = await User.findOne({ username });
      if (!dbUser) return;

      const contacts = dbUser.contacts;

      for (const contactId of contacts) {
        const contactUser = await User.findById(contactId);
        if (!contactUser) continue;

        const contactSocketId = await redis.hget('onlineUsers', contactUser.username);
        if (contactSocketId) {
          io.to(contactSocketId).emit('friendOffline', username);
          console.log(`Emitting friendOffline to ${contactUser.username}`);
        }
      }
    }
  });
});


export { io };
export default server;

if (process.env.NODE_ENV !== 'test') {
  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
}
