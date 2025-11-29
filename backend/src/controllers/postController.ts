import { Request, Response } from "express";
import Post from "../models/postModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

// -----------------------------
// GET PRESIGNED URL
// -----------------------------
export const getPresignedUrl = async (req: Request, res: Response) => {
    try {
        const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;

        if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
            console.log("Missing Cloudinary environment variables");
            return res.status(500).send({ message: "Internal server error" });
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "posts";

        const signature = cloudinary.v2.utils.api_sign_request(
            { timestamp, folder },
            CLOUDINARY_API_SECRET
        );

        return res.json({
            timestamp,
            folder,
            signature,
            cloudName: CLOUDINARY_CLOUD_NAME,
            apiKey: CLOUDINARY_API_KEY,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Could not generate signature." });
    }
};


// CREATE POST
export const createPost = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const { content, media } = req.body;

        if (!userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        if ((!content || content.trim() === "") && (!media || media.length === 0)) {
            return res
                .status(400)
                .send({ message: "Post must have either content or media." });
        }

        const newPost = await Post.create({
            user: userId,
            content,
            media: media || [],
        });

        return res.status(201).json({
            message: "Post created successfully",
            post: newPost,
        });

    } catch (error) {
        console.log("Error creating post:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


// GET SINGLE POST
export const getPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).send({ message: "Invalid post ID" });
        }

        const post = await Post.findById(postId)
            .populate("user", "username profilePic") // only fields needed
            .lean();

        if (!post) return res.status(404).send({ message: "Post not found" });

        return res.json(post);

    } catch (error) {
        console.log("Error fetching post:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


// GET FEED (PAGINATED)
export const getFeed = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profilePic")
            .lean();

        return res.json({ page, posts });

    } catch (error) {
        console.log("Error fetching feed:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
