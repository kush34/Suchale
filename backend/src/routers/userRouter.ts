import express from "express";
import verifyToken from "../middlewares/verifyToken";
import { addContact, blockUser, firebaseTokenVerify, followUserByUsername, getUserProfile, login, logoutUser, profilePic, register, search, sendMail, subscribe, unFollowUserByUsername, userInfo, userList, usernameCheck, verifyOtp } from "../controllers/userController";

const router = express.Router();


router.post('/create', register)

router.post("/sendOtp", sendMail)

router.post('/verifyOtp', verifyOtp)

router.post('/usernameCheck', usernameCheck)

router.post('/login', login)

router.get('/userList', verifyToken, userList)

router.post("/search", verifyToken, search);

router.post("/profilepic", verifyToken, profilePic)

router.post('/addContact', verifyToken, addContact);

router.get("/userInfo", verifyToken, userInfo);

router.post("/subscribe", verifyToken, subscribe);

router.post("/firebaseTokenVerify", firebaseTokenVerify)

router.get("/profile/:username",verifyToken,getUserProfile)

router.post("/blockUser/:usernameToBlock",verifyToken,blockUser)

router.post("/follow/:usernameToFollow",verifyToken,followUserByUsername)

router.post("/unfollow/:usernameToUnfollow",verifyToken,unFollowUserByUsername)

router.get("/logout",verifyToken,logoutUser)

export default router;