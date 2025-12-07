import express from 'express';
import verifyToken from '../middlewares/verifyToken'
import upload from '../middlewares/multer';
import { createGroup, deletedMsgById, getMembersByGroupId, getMessages, media, reactToMsg, searchUserMsgs, sendMsg, updateMsgById } from '../controllers/messageController';


const router = express.Router();

router.delete('/deleteMsg/:messageId', verifyToken, deletedMsgById);

// POST routes
router.post('/send', verifyToken, sendMsg);

router.post('/reactToMsg', verifyToken, reactToMsg);

router.post('/updateMsg', verifyToken, updateMsgById);

router.post("/getMessages", verifyToken, getMessages);

router.post('/media', verifyToken, upload.single('file'), media)

router.post("/createGroup", verifyToken, createGroup)

router.post("/getMembers/:groupId", verifyToken, getMembersByGroupId)

router.get("/search", verifyToken, searchUserMsgs);
export default router;  