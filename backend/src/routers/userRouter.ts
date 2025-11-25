import express from "express";
import verifyToken from "../middlewares/verifyToken";
import { addContact, firebaseTokenVerify, login, profilePic, register, search, sendMail, subscribe, userInfo, userList, usernameCheck, verifyOtp } from "../controllers/userController";
import upload from "../middlewares/multer";

const router = express.Router();


router.post('/create', register)

router.post("/sendOtp", sendMail)

router.post('/verifyOtp', verifyOtp)

router.post('/usernameCheck', usernameCheck)

router.post('/login', login)

router.get('/userList', verifyToken, userList)

router.post("/search", verifyToken, search);

router.post("/profilepic", verifyToken, upload.single('file'), profilePic)

router.post('/addContact', verifyToken, addContact);

router.get("/userInfo", verifyToken, userInfo);

router.post("/subscribe", verifyToken, subscribe);

router.post("/firebaseTokenVerify", firebaseTokenVerify)

export default router;