import express from 'express';
import verifyToken from '../middlewares/verifyToken'
import upload from '../middlewares/multer';
import { createGroup, getMembersByGroupId, getMessages, media, sendMsg } from '../controllers/messageController';


const router = express.Router();
router.post('/send', verifyToken, sendMsg);

router.post("/getMessages", verifyToken, getMessages);

router.post('/media', verifyToken, upload.single('file'), media)

router.post("/createGroup", verifyToken, createGroup)

router.post("/getMembers/:groupId", verifyToken, getMembersByGroupId)

export default router;  