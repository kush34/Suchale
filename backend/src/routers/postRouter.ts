import express from "express";
import verifyToken from "../middlewares/verifyToken";
import { createPost, getFeed, getPost, getPresignedUrl } from "../controllers/postController";

const router = express.Router();

router.get("/preSignedUrl", verifyToken, getPresignedUrl)

router.get("/feed", verifyToken, getFeed)

router.get("/", verifyToken, getPost)

router.post("/", verifyToken, createPost)



export default router;