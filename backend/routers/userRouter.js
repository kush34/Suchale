import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { addContact, login, profilePic, register, search, subscribe, userInfo, userList, usernameCheck, verifyOtp } from "../controllers/userController.js";
import { sendOtp } from "../controllers/sendOtp.js";
import upload from "../middlewares/multer.js";

const router = express.Router();


router.post('/create', register)

router.post("/sendOtp", sendOtp)

router.post('/verifyOtp', verifyOtp)

router.post('/usernameCheck', usernameCheck)

router.post('/login', login)

router.get('/userList', verifyToken, userList)

router.post("/search", verifyToken, search);

router.post("/profilepic", verifyToken, upload.single('file'), profilePic)

router.post('/addContact', verifyToken, addContact);

router.get("/userInfo", verifyToken, userInfo);

router.post("/subscribe", verifyToken, subscribe);

export default router;