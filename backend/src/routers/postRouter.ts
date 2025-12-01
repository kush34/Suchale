import express from "express";
import verifyToken from "../middlewares/verifyToken";
import { commentPost, createPost, getFeed, getPost, getPresignedUrl, likePost,getPostById } from "../controllers/postController";

const router = express.Router();

router.post("/like/:postId", verifyToken, likePost)

router.post("/comment/:postId", verifyToken, commentPost)


router.get("/preSignedUrl", verifyToken, getPresignedUrl)

router.get("/feed", verifyToken, getFeed)

router.get("/", verifyToken, getPost)

router.post("/", verifyToken, createPost)

router.get("/:postId", verifyToken, getPostById)

export default router;