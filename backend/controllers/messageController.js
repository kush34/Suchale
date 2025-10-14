
import sendNotification from '../utils/webpush.js';
import Message from '../models/messageModel.js';
import { io } from "../index.js"
import upload from '../middlewares/multer.js';
import Group from '../models/groupModel.js';
import User from '../models/userModel.js';
import redis from '../utils/redis.js';


export const sendMsg = async (req, res) => {
    try {
        const fromUser = req.username;
        const { toUser, content, isGroup = false, groupId } = req.body;

        if (!content || content.trim() === "")
            return res.status(400).send({ error: "content is required" });
        if (isGroup && !groupId)
            return res.status(400).send({ error: "groupId required" });
        if (!isGroup && !toUser)
            return res.status(400).send({ error: "toUser required" });

        console.log(`Group Msg: ${isGroup}, GroupId: ${groupId}, content: ${content}`);

        const newMsg = await Message.create({
            fromUser,
            toUser,
            content,
            groupId
        });
        if (!newMsg) return res.status(500).send("failed to create message");

        if (!isGroup) {
            const receiverSocketId = await redis.hget('onlineUsers', toUser);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('sendMsg', newMsg);
            } else {
                const dbUser = await User.findOne({ username: toUser });
                if (dbUser?.pushSubscription) {
                    console.log(`User OFFLINE: ${dbUser.username}. Sending Notification...`);
                    sendNotification.sendNotification(
                        dbUser.pushSubscription,
                        JSON.stringify({
                            title: "New Message",
                            body: `You received a message from ${fromUser}`,
                            icon: "/icon.png",
                            data: { url: `/chat/${fromUser}` }
                        })
                    );
                }
            }

            return res.status(200).send(newMsg);
        }

        const senderSocketId = await redis.hget('onlineUsers', fromUser);
        if (senderSocketId) {
            const senderSocket = io.sockets.sockets.get(senderSocketId);
            if (senderSocket) {
                senderSocket.to(groupId).emit("sendMsgGrp", newMsg);
            }
        }

        res.status(200).send(newMsg);
    } catch (error) {
        console.error(error);
        res.status(500).send("something went wrong");
    }
}

export const getMessages = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const username = req.username;
        const { toUser, groupId, isGroup } = req.body;
        if (isGroup && !groupId) {
            return res.status(400).json({ error: "groupId is required for group messages." });
        }
        if (!isGroup && !toUser) {
            return res.status(400).json({ error: "toUser is required for direct messages." });
        }

        let messages = [];
        let countMsgs = 0;

        if (isGroup) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ error: "Group not found." });
            }

            countMsgs = await Message.countDocuments({ groupId: group._id });

            messages = await Message.find({ groupId: group._id })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit);

        } else {
            countMsgs = await Message.countDocuments({
                $or: [
                    { fromUser: username, toUser },
                    { fromUser: toUser, toUser: username }
                ]
            });

            messages = await Message.find({
                $or: [
                    { fromUser: username, toUser },
                    { fromUser: toUser, toUser: username }
                ]
            })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit);

            // Mark received messages as read
            const updateResult = await Message.updateMany(
                { fromUser: toUser, toUser: username, read: false },
                { $set: { read: true } }
            );

            console.log(`Marked ${updateResult.modifiedCount} messages as read`);
        }

        res.status(200).json({
            messages,
            hasMore: countMsgs > page * limit
        });
    } catch (err) {
        console.error("Error in /getMessages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}

export const media = async (req, res) => {
    try {
        const username = req.username;
        const { toUser } = req.body;
        if (!req.file || !toUser) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        let newMsg = await Message.create(
            {
                fromUser: username,
                toUser,
                content: req.file.path
            }
        );
        if (newMsg) {
            const onlineUsers = await redis.hget("online_users");

            const receiverSocketId = onlineUsers[toUser];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('sendMsg', newMsg);
            }
            res.status(200).json({ url: req.file.path });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send("something went wrong");
    }
}

export const createGroup = async (req, res) => {
    try {
        const username = req.username;
        const { name, photoURL, users } = req.body;
        if (!name) return res.status(400).send({ error: "group name is required for group creation." });

        const dbUser = await User.findOne({ username });
        if (!dbUser) return res.status(400).send({ error: "user not found. pls login again or retry" });
        const newGroup = await Group.create({
            name,
            photoURL,
            users: [...users, dbUser._id],
            admin: dbUser._id
        });
        await User.updateMany(
            { _id: { $in: users } },
            { $addToSet: { groups: newGroup._id } }
        );
        await User.updateOne(
            { _id: { $in: dbUser._id } },
            { $addToSet: { groups: newGroup._id } }
        );
        res.send({ newGroup });
    } catch (error) {
        console.error(`ERROR:${error}`)
        return res.status(500).send({ error: "Something went wrong on the server." });
    }
}

export const getMembersByGroupId = async (req, res) => {
    try {
        const username = req.username;
        const { groupId } = req.params;
        console.log(username)
        if (!groupId) return res.status(400).send("groupId not found in request.")

        const [userDB, groupDB] = await Promise.all([
            User.findOne({ username }),
            Group.findById({ _id: groupId })
        ])

        if (!groupDB) return res.status(404).send("group not found.")
        if (!userDB) return res.status(404).send("user not found.")
        if (!groupDB.users.includes(userDB._id)) return res.status(400).send(`user not member of ${groupDB.name}.`)

        const members = await User.find({ _id: { $in: groupDB.users } }).select("username profilePic");

        res.send(members);
    } catch (error) {
        console.log(error)
        res.send({ error: "Something went wrong on the Server" });
    }
}