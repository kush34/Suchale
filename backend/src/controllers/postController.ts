import { Request, Response } from "express";
import Post from "../models/postModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import { notifyMentionedUsers } from "../services/notificationService";

type IncomingMention = {
    id: string;
    username?: string;
};

const formatMentions = (mentions: any[] = []) =>
    mentions.map((mention) => ({
        userId: mention.userId?._id ?? mention.userId,
        username: mention.username ?? mention.userId?.username ?? "",
    }));

const formatPostForResponse = (post: any, userId?: string) => ({
    ...post,
    mentions: formatMentions(post.mentions || []),
    isLiked: userId
        ? post.engagement?.likes?.some(
              (like: any) => like.user.toString() === userId
          )
        : post.isLiked,
});

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
        const actorUsername = req.username;
        const { content, media, mentions = [] } = req.body as {
            content?: string;
            media?: string[];
            mentions?: IncomingMention[];
        };
        console.log(`New Post Received for ${actorUsername}`)
        console.log("mentions", mentions);  
        if (!userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        if ((!content || content.trim() === "") && (!media || media.length === 0)) {
            return res
                .status(400)
                .send({ message: "Post must have either content or media." });
        }

        if (!Array.isArray(mentions)) {
            return res.status(400).send({ message: "mentions must be an array" });
        }

        const hasInvalidMention = mentions.some((mention) => {
            const mentionId = mention?.id?.trim();
            return !mentionId || !mongoose.isValidObjectId(mentionId);
        });

        if (hasInvalidMention) {
            return res.status(400).send({
                message: "Each mention must include a valid user id.",
            });
        }

        const seenMentionIds = new Set<string>();
        const mentionIds = mentions
            .map((mention) => mention?.id?.trim())
            .filter((id): id is string => Boolean(id))
            .filter((id) => {
                if (seenMentionIds.has(id)) {
                    return false;
                }

                seenMentionIds.add(id);
                return true;
            });

        const mentionedUsers = mentionIds.length
            ? await User.find({ _id: { $in: mentionIds } })
                .select("_id username profilePic pushSubscription")
                .lean()
            : [];

        if (mentionIds.length !== mentionedUsers.length) {
            return res.status(400).send({
                message: "One or more mentioned users were not found.",
            });
        }
        console.log(`New Post contains tags : ${mentionIds}`)
        const usersById = new Map(
            mentionedUsers.map((user) => [user._id.toString(), user])
        );
        const normalizedMentions = mentionIds
            .map((id) => usersById.get(id))
            .filter((user): user is (typeof mentionedUsers)[number] => Boolean(user))
            .map((user) => ({
                userId: user._id,
                username: user.username,
            }));

        const newPost = await Post.create({
            user: userId,
            content,
            media: media || [],
            mentions: normalizedMentions,
        });

        const populatedPost = await newPost.populate([
            { path: "user", select: "username profilePic" },
            { path: "mentions.userId", select: "username profilePic" },
        ]);

        if (normalizedMentions.length > 0 && actorUsername) {
            console.log(`Notifing users for ${actorUsername} for ${normalizedMentions}`)
            void notifyMentionedUsers({
                actorId: userId,
                actorUsername,
                postId: (newPost._id as mongoose.Types.ObjectId).toString(),
                postContent: content || "",
                recipients: mentionedUsers
                    .filter((user) => user._id.toString() !== userId)
                    .map((user) => ({
                        _id: user._id,
                        username: user.username,
                        pushSubscription: user.pushSubscription,
                    })),
            });
        }

        return res.status(201).json({
            message: "Post created successfully",
            post: formatPostForResponse(populatedPost.toObject(), userId),
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
            .populate("user", "username profilePic")
            .populate("mentions.userId", "username profilePic")
            .lean();

        if (!post) return res.status(404).send({ message: "Post not found" });

        return res.json(formatPostForResponse(post));

    } catch (error) {
        console.log("Error fetching post:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


export const getFeed = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profilePic")
            .populate("mentions.userId", "username profilePic")
            .lean();

        const feed = posts.map(post => ({
            ...formatPostForResponse(post, userId),
        }));

        return res.json({ page, posts: feed });

    } catch (error) {
        console.log("Error fetching feed:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};



export const likePost = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;

        if (!userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        if (!postId) {
            return res.status(400).send({ message: "postId required" });
        }

        // Convert userId to ObjectId for proper comparison with MongoDB
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const added = await Post.findOneAndUpdate(
            {
                _id: postId,
                "engagement.likes.user": { $ne: userObjectId }
            },
            {
                $push: {
                    "engagement.likes": { user: userObjectId, likedAt: new Date() }
                }
            },
            { new: true }
        );

        if (added) {
            return res.send({ message: "Liked the post", post: added });
        }

        const removed = await Post.findOneAndUpdate(
            { _id: postId },
            {
                $pull: {
                    "engagement.likes": { user: userObjectId }
                }
            },
            { new: true }
        );

        return res.send({ message: "Removed like from post", post: removed });

    } catch (error) {
        console.log(`ERROR / likePost: ${error}`);
        return res.status(500).send({ message: "Internal server error" });
    }
};


export const commentPost = async (req: Request, res: Response) => {
    try {
        if (!req.id) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        const userId = new mongoose.Types.ObjectId(req.id);

        const { postId } = req.params;
        const { content } = req.body;

        if (!postId || !content?.trim()) {
            return res.status(400).send({ message: "postId and content are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }

        const newComment = {
            userId: userId,
            content: content.trim(),
            createdAt: new Date(),
        };

        post.engagement.comments.push(newComment);
        await post.save();

        return res.send({ message: "Comment added", data: newComment });

    } catch (error) {
        console.log(`ERROR /commentPost: ${error}`);
        return res.status(500).send({ message: "Internal server error" });
    }
};


export const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.id;

        if (!postId) {
            return res.status(400).json({ message: "postId required" });
        }

        const post = await Post.findById(postId)
            .populate("user", "username profilePic")
            .populate("mentions.userId", "username profilePic")
            .populate("engagement.comments.userId", "username profilePic");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Transform comments for UI  
        const formattedComments = post.engagement.comments.map((c) => ({
            userId: c.userId?._id,
            username: (c.userId as any)?.username,
            profilePic: (c.userId as any)?.profilePic,
            content: c.content,
            createdAt: c.createdAt,
        }));

        //  modify as req on  frontend side  
        const responsePost = {
            _id: post._id,
            user: {
                profilePic: (post.user as any).profilePic,
                username: (post.user as any).username,
            },
            media: post.media,
            content: post.content,
            mentions: formatMentions(post.mentions || []),
            engagement: {
                likes: post.engagement.likes,
                comments: formattedComments,
            },
            isLiked: post.engagement?.likes?.some(
                (like: any) => like.user.toString() === userId
            )
        };

        return res.status(200).json({
            message: "Post fetched",
            data: responsePost
        });

    } catch (error) {
        console.error("getPostById error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
