import express from 'express';
import verifyToken from '../middlewares/verifyToken.js'
const router = express.Router();
import Message from '../models/messageModel.js';
import {io, onlineUsers} from "../index.js"

router.post('/send',verifyToken,async (req,res)=>{
    try {
        const username = req.username;
        const { toUser,content} = req.body;
        if(!toUser || !content) {
            res.status(400).send("not enough data");
            return;
        }
        const newMsg = await Message.create({
            fromUser:username,
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

router.post('/getMessages',verifyToken,async (req,res)=>{
    try {
        const username = req.username;
        const { toUser } = req.body;
        if(!toUser) {
            res.status(400).send("not enough data");
            return;
        }
        // const newMsg = await Message.find({
        //     fromUser:username,
        //     toUser,
        // })  
        const newMsg = await Message.find({
            $or: [
                { fromUser: username, toUser: toUser },
                { fromUser: toUser, toUser: username }
            ]
        })
        if(newMsg){
            res.status(200).send(newMsg);
        }
    } catch (error) {
        res.status(500).send("something went wrong")
    }
})


export default router;  