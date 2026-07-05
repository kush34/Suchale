import cloudinary from "../utils/cloudinary";
import Story from "../models/storyModel";

export const generateStoryUploadSignature = (userId: string) => {
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    timestamp,
    folder: "stories",
    tags: `story,user:${userId}`,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: "stories",
    tags: params.tags,
  };
};
export const createStory = async ({
  userId,
  body,
}: {
  userId: string;
  body: {
    caption?: string;
    publicId: string;
    url: string;
    resourceType: "image" | "video";
    format?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}) => {
  const story = await Story.create({
    user: userId,
    caption: body.caption,
    media: {
      publicId: body.publicId,
      url: body.url,
      resourceType: body.resourceType,
      format: body.format,
      width: body.width,
      height: body.height,
      duration: body.duration,
    },
  });

  return Story.findById(story._id).populate(
    "user",
    "username fullName profilePic",
  );
};
import User from "../models/userModel";

export const getFeedStories = async (userId: string) => {
  const user = await User.findById(userId).select("following");

  if (!user) {
    throw new Error("User not found");
  }

  const stories = await Story.find({
    user: {
      $in: user.following,
    },
  })
    .populate("user", "username fullName profilePic")
    .sort({
      createdAt: -1,
    });

  const grouped = new Map<string, any>();

  for (const story of stories) {
    const key = story.user._id.toString();

    if (!grouped.has(key)) {
      grouped.set(key, {
        user: story.user,
        stories: [],
      });
    }

    grouped.get(key).stories.push(story);
  }

  return [...grouped.values()];
};
export const getUserStories = async (userId: string) => {
  return Story.find({
    user: userId,
  })
    .populate("user", "username fullName profilePic")
    .sort({
      createdAt: 1,
    });
};
export const markStoryViewed = async (storyId: string, userId: string) => {
  const story = await Story.findByIdAndUpdate(
    storyId,
    {
      $addToSet: {
        viewers: userId,
      },
    },
    {
      new: true,
    },
  );

  if (!story) {
    throw new Error("Story not found");
  }

  return story;
};

export const getStoryViewers = async (storyId: string, userId: string) => {
  const story = await Story.findById(storyId).populate(
    "viewers",
    "username fullName profilePic",
  );

  if (!story) {
    throw new Error("Story not found");
  }

  if (story.user.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  return story.viewers;
};

export const deleteStory = async (storyId: string, userId: string) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  if (story.user.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await cloudinary.uploader.destroy(story.media.publicId, {
    resource_type: story.media.resourceType,
  });

  await story.deleteOne();

  return {
    success: true,
  };
};
