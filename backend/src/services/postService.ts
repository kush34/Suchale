import mongoose from "mongoose";

import Post from "../models/postModel";
import User from "../models/userModel";


import { CreatePostDto } from "../validators/post-validator";
import { notifyMentionedUsers } from "./notificationService";

type CreatePostServiceParams = {
  userId: string;
  actorUsername: string;
  data: CreatePostDto;
};

export const formatMentions = (mentions: any[] = []) =>
    mentions.map((mention) => ({
        userId: mention.userId?._id ?? mention.userId,
        username: mention.username ?? mention.userId?.username ?? "",
    }));

export const formatPostForResponse = (post: any, userId?: string) => ({
    ...post,
    mentions: formatMentions(post.mentions || []),
    isLiked: userId
        ? post.engagement?.likes?.some(
            (like: any) => like.user.toString() === userId
        )
        : post.isLiked,
});


export const createPostService = async ({
  userId,
  actorUsername,
  data,
}: CreatePostServiceParams) => {
  const {
    content,
    media,
    mentions,
    hashtags,
  } = data;

  // Remove duplicate mentions
  const mentionIds = [
    ...new Set(mentions.map((m) => m.id)),
  ];

  // Fetch mentioned users
  const mentionedUsers =
    mentionIds.length > 0
      ? await User.find({
          _id: { $in: mentionIds },
        })
          .select(
            "_id username profilePic pushSubscription"
          )
          .lean()
      : [];

  if (mentionIds.length !== mentionedUsers.length) {
    throw new Error(
      "One or more mentioned users were not found."
    );
  }

  const usersById = new Map(
    mentionedUsers.map((user) => [
      user._id.toString(),
      user,
    ])
  );

  const normalizedMentions = mentionIds
    .map((id) => usersById.get(id))
    .filter(
      (
        user
      ): user is (typeof mentionedUsers)[number] =>
        Boolean(user)
    )
    .map((user) => ({
      userId: user._id,
      username: user.username,
    }));

  // Create post
  const newPost = await Post.create({
    user: new mongoose.Types.ObjectId(userId),
    content,
    media,
    mentions: normalizedMentions,
    hashtags,
  });

  const populatedPost = await newPost.populate([
    {
      path: "user",
      select: "username profilePic",
    },
    {
      path: "mentions.userId",
      select: "username profilePic",
    },
  ]);

  // Fire-and-forget notifications
  if (
    normalizedMentions.length > 0 &&
    actorUsername
  ) {
    void notifyMentionedUsers({
      actorId: userId,
      actorUsername,
      postId: (
        newPost._id as mongoose.Types.ObjectId
      ).toString(),
      postContent: content ?? "",
      recipients: mentionedUsers
        .filter(
          (user) =>
            user._id.toString() !== userId
        )
        .map((user) => ({
          _id: user._id,
          username: user.username,
          pushSubscription:
            user.pushSubscription,
        })),
    });
  }

  return formatPostForResponse(
    populatedPost.toObject(),
    userId
  );
};