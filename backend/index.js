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


const onlineUsers = new Map();
const socketToUsername = new Map();

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('addUser', async (userId) => {
    onlineUsers.set(userId, socket.id);
    socketToUsername.set(socket.id, userId);
    socket.userId = userId;
    const dbUser = await User.findOne({ username: userId }); // assuming userId == username
    if (!dbUser) return;

    const groups = await Group.find({ users: dbUser._id }).select("_id name");

    groups.forEach((group) => {
      socket.join(group._id.toString());
      console.log(`User: ${userId} joined group ${group.name} ${group._id}`);
    })
    const contacts = dbUser.contacts;

    for (const contactId of contacts) {
      const contactUser = await User.findById(contactId);
      if (contactUser && onlineUsers.has(contactUser.username)) {
        const contactSocketId = onlineUsers.get(contactUser.username);

        if (contactSocketId) {
          io.to(contactSocketId).emit('friendOnline', userId);
          console.log(`Emitting friendOnline to ${contactUser.username}`);
        }
      }
    }
  });
  socket.on("typing", ({ to }) => {
    // Forward "typing" event to recipient
    const recipientSocketId = onlineUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { from: socket.userId });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const recipientSocketId = onlineUsers.get(to);
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

    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id },
    });

    io.to(groupId).emit("newGroupMessage", {
      groupId,
      message,
    });
  });

  socket.on("readMessages", async ({ fromUser, toUser }) => {
    await Message.updateMany(
      { from: fromUser, to: toUser, read: false },
      { $set: { read: true } }
    );
    io.to(fromUser).emit("messagesReadBy", { toUser });
  });

  socket.on('disconnect', async () => {
    const username = socketToUsername.get(socket.id);
    console.log('Disconnected user:', username);

    if (username) {
      onlineUsers.delete(username);
      socketToUsername.delete(socket.id);

      const dbUser = await User.findOne({ username });
      if (!dbUser) return;

      const contacts = dbUser.contacts;

      for (const contactId of contacts) {
        const contactUser = await User.findById(contactId);
        if (contactUser && onlineUsers.has(contactUser.username)) {
          const contactSocketId = onlineUsers.get(contactUser.username); // Fixed here

          if (contactSocketId) {
            io.to(contactSocketId).emit('friendOffline', username);
            console.log(`Emitting friendOffline to ${contactUser.username}`);
          }
        }
      }
    }
  });

});

export { io, onlineUsers };

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
