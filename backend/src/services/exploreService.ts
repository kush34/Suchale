import Post from "../models/postModel";
import User from "../models/userModel";
import { searchRegex } from "../utils/input";

// services/explore.service.ts
export const search = async (query: string) => {
  if (!query.trim()) return [];

  const regex = searchRegex(query);

  const [users, posts] = await Promise.all([
    User.find({
      $or: [{ username: regex }, { fullName: regex }],
    })
      .select("_id username fullName profilePic")
      .limit(10),

    Post.find({
      content: regex,
    })
      .populate("user", "username fullName profilePic")
      .limit(10),
  ]);

  return {
    users,
    posts,
  };
};

export const getTrending = async () => {
  return Post.aggregate([
    {
      $unwind: "$hashtags",
    },
    {
      $group: {
        _id: "$hashtags",
        numberOfPosts: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        numberOfPosts: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        title: "$_id",
        numberOfPosts: 1,
      },
    },
  ]);
};

export const getSuggestions = async (username: string) => {
  const me = await User.findOne({
    username,
  });

  if (!me) return [];

  return User.find({
    _id: {
      $nin: [...me.following, me._id],
    },
  })
    .sort({
      followers: -1,
    })
    .limit(10)
    .select("_id username fullName profilePic followers");
};

