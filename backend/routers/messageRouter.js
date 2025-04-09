import express from 'express';
import verifyToken from '../middlewares/verifyToken.js'
const router = express.Router();
import Message from '../models/messageModel.js';

router.post('/send',verifyToken,async (req,res)=>{
    try {
        const username = req.username;
        const { toUser,content} = req.body;
        // console.log(toUser,content);
        if(!toUser || !content) {
            res.status(400).send("not enough data");
            return;
        }
        const newMsg = await Message.create({
            fromUser:username,
            toUser,
            content
        })  
        if(newMsg){
            
            res.status(200).send("msg sent");
        }
    } catch (error) {
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
        const newMsg = await Message.find({
            fromUser:username,
            toUser,
        })  
        if(newMsg){
            res.status(200).send(newMsg);
        }
    } catch (error) {
        res.status(500).send("something went wrong")
    }
})


export default router;  