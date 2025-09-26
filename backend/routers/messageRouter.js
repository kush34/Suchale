import express from 'express';
import verifyToken from '../middlewares/verifyToken.js'
const router = express.Router();
import Message from '../models/messageModel.js';
import { io, onlineUsers } from "../index.js"
import upload from '../middlewares/multer.js';

router.post('/send', verifyToken, async (req, res) => {
    try {
        const username = req.username;
        const { toUser, content } = req.body;
        if (!toUser || !content) {
            res.status(400).send("not enough data");
            return;
        }
        const newMsg = await Message.create({
            fromUser: username,
            toUser,
            content
        })
        if (newMsg) {
            const receiverSocketId = onlineUsers.get(toUser);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('sendMsg', newMsg);
            }
            // Add this so response is always sent
            res.status(200).send("msg sent");
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("something went wrong")
    }
})

router.post("/getMessages", verifyToken, async (req, res) => {
    try {
        //page
        //limit = 20
        //skip = (page - 1) * limit
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 20;
        let skip = (page - 1) * limit;
        const username = req.username;
        const { toUser } = req.body;
        if (!toUser) {
            return res.status(400).send("toUser is required");
        }
        console.log(`fromUser:${username} toUser: ${toUser}`)
        const countMsgs = await Message.countDocuments({
            $or: [
                { fromUser: username, toUser: toUser },
                { fromUser: toUser, toUser: username }
            ]
        })
        const messages = await Message.find({
            $or: [
                { fromUser: username, toUser: toUser },
                { fromUser: toUser, toUser: username }
            ]
        }).sort({ createdAt: 1 }).limit(limit).skip(skip);

        console.log(messages);
        const updateResult = await Message.updateMany(
            { fromUser: toUser, toUser: username, read: false },
            { $set: { read: true } }
        );
        console.log(updateResult);

        console.log(`Marked ${updateResult.modifiedCount} messages as read`);

        res.status(200).json({message:messages,hasMore:(countMsgs - messages.length > 0)});
    } catch (err) {
        console.error("Error in /getMessages:", err);
        res.status(500).send("Failed to fetch messages");
    }
});



router.post('/media', verifyToken, upload.single('file'), async (req, res) => {
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
            const receiverSocketId = onlineUsers.get(toUser);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('sendMsg', newMsg);
            }
            res.status(200).json({ url: req.file.path });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send("something went wrong");
    }
})

export default router;  