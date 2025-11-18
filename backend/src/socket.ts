import { io } from "./index";
import Group from "./models/groupModel";
import Message from "./models/messageModel";
import User from "./models/userModel";
import redis from "./utils/redis";
import { Server, Socket } from 'socket.io';


type ExtendedSocket = Socket & { userId?: string };


export default function socketHandler(io: Server) {
    io.on('connection', (socket: ExtendedSocket) => {
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
}