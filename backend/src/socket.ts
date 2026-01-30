import { Server, Socket } from 'socket.io';
import Group from "./models/groupModel";
import Message from "./models/messageModel";
import User from "./models/userModel";
import redis from "./utils/redis";
import { verifySocketToken } from "./middlewares/verifyToken";
import Call from "./models/callModel";
import { error } from 'node:console';

// Define the shape of the data attached to the socket via middleware
interface SocketData {
    user: {
        id: string;
        username: string;
        email: string;
    }
}

// Extend the Socket type to include our custom data
type AuthenticatedSocket = Socket<any, any, any, SocketData>;

export default function socketHandler(io: Server) {
    // 1. Apply Authentication Middleware
    io.use(verifySocketToken);

    io.on('connection', async (socket: AuthenticatedSocket) => {
        // Extract user info from the token (populated in verifySocketToken)
        const { id: userId, username } = socket.data.user;

        console.log(`⚡ User connected: ${username} (Socket ID: ${socket.id})`);

        // 2.Mark user as online and join rooms
        try {
            await redis.hset('onlineUsers', username, socket.id);
            await redis.hset('socketToUsername', socket.id, username);

            const dbUser = await User.findById(userId).populate('contacts');
            if (dbUser) {
                // join all groups the user belongs to
                const groups = await Group.find({ users: userId }).select("_id name");
                groups.forEach((group) => {
                    const roomName = group._id.toString();
                    socket.join(roomName);
                    console.log(`👥 ${username} joined group: ${group.name}`);
                });

                // Notify contacts that user is online
                for (const contact of (dbUser.contacts as any)) {
                    const contactSocketId = await redis.hget('onlineUsers', contact.username);
                    if (contactSocketId) {
                        io.to(contactSocketId).emit('friendOnline', username);
                    }
                }
            }
        } catch (error) {
            console.error("Error during socket initialization:", error);
        }

        // 3. TYPING EVENTS
        socket.on("typing", async ({ to }) => {
            const recipientSocketId = await redis.hget('onlineUsers', to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("typing", { from: username });
            }
        });

        socket.on("stopTyping", async ({ to }) => {
            const recipientSocketId = await redis.hget('onlineUsers', to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("stopTyping", { from: username });
            }
        });

        // 4. GROUP MESSAGING
        socket.on("sendGroupMessage", async ({ groupId, content }) => {
            try {
                const message = await Message.create({
                    sender: userId,
                    content,
                    chat: groupId,
                });

                await Group.findByIdAndUpdate(groupId, { $push: { messages: message._id } });

                // Emit to everyone in the room (including sender)
                io.to(groupId).emit("newGroupMessage", { groupId, message });
            } catch (error) {
                console.error("Group message error:", error);
            }
        });

        // 5. READ RECEIPTS
        socket.on("readMessages", async ({ fromUser }) => {
            try {
                await Message.updateMany(
                    { from: fromUser, to: userId, read: false },
                    { $set: { read: true } }
                );

                const fromSocketId = await redis.hget('onlineUsers', fromUser);
                if (fromSocketId) {
                    io.to(fromSocketId).emit("messagesReadBy", { byUser: username });
                }
            } catch (error) {
                console.error("Read receipt error:", error);
            }
        });

        socket.on("initiateAudioCall", async ({ to_username }) => {
            console.log(`Call Initaited from ${username} to ${to_username}`)
            const recipientSocketId = await redis.hget('onlineUsers', to_username);
            if (recipientSocketId) {
                // console.log(`Calling socket ID:${recipientSocketId}`)
                const toDbUser = await User.findOne({ username: to_username })
                if (!toDbUser) {
                    throw new error("Could not call the user. as user does not exists.")
                }
                const audioCall = await Call.create({
                    user_id: userId,
                    to_user_id: toDbUser._id
                })
                io.to(recipientSocketId).emit("incomingAudioCall", { from: username, callId: audioCall._id });
            } else {
                console.log("user not found inline")
            }
        });
        socket.on("answerIncomingAudioCall", async ({ from, callId }) => {
            console.log(`Answering Call from ${username} to ${from}`)
            const recipientSocketId = await redis.hget('onlineUsers', from);
            if (recipientSocketId) {
                await Call.findByIdAndUpdate(
                    callId
                    , {
                        pickedAt: Date.now()
                    })
                io.to(recipientSocketId).emit("callAnswered", { from: username, callId });
            } else {
                console.log("user not found inline")
            }
        });
        socket.on("sendOffer", async ({ to, callId, offer }) => {
            const recipientSocketId = await redis.hget("onlineUsers", to);
            if (!recipientSocketId) return;

            io.to(recipientSocketId).emit("receiveOffer", {
                from: username,
                callId,
                offer,
            });
        });
        socket.on("sendAnswer", async ({ to, callId, answer }) => {
            const recipientSocketId = await redis.hget("onlineUsers", to);
            if (!recipientSocketId) return;

            io.to(recipientSocketId).emit("receiveAnswer", {
                from: username,
                callId,
                answer,
            });
        });
        socket.on("endAudioCall", async ({ callId, to }) => {
            const call = await Call.findById(callId);
            if (!call) return;

            const endedAt = new Date();

            const startTime = call.pickedAt ?? call.createdAt;
            const durationSeconds = Math.floor(
                (endedAt.getTime() - startTime.getTime()) / 1000
            );

            await Call.findByIdAndUpdate(callId, {
                endedAt,
                duration: durationSeconds,
            });

            const recipientSocketId = await redis.hget("onlineUsers", to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("audioCallEnded", { callId });
            }
        });

        socket.on("sendCandidate", async ({ to, callId, candidate }) => {
            const recipientSocketId = await redis.hget("onlineUsers", to);
            if (!recipientSocketId) return;

            io.to(recipientSocketId).emit("receiveCandidate", {
                from: username,
                callId,
                candidate,
            });
        });

        socket.on('disconnect', async () => {
            console.log('❌ Disconnected user:', username);

            await redis.hdel('onlineUsers', username);
            await redis.hdel('socketToUsername', socket.id);

            try {
                const dbUser = await User.findById(userId).populate('contacts');
                if (dbUser) {
                    for (const contact of (dbUser.contacts as any)) {
                        const contactSocketId = await redis.hget('onlineUsers', contact.username);
                        if (contactSocketId) {
                            io.to(contactSocketId).emit('friendOffline', username);
                        }
                    }
                }
            } catch (error) {
                console.error("Disconnect cleanup error:", error);
            }
        });
    });
}