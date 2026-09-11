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
  // ponytail: verify the asset actually came through our signed upload (issue #15) —
  // client-supplied publicId/url alone lets anyone attach arbitrary hotlinks.
  const asset = await cloudinary.api
    .resource(body.publicId, { resource_type: body.resourceType })
    .catch(() => null);

  if (!asset) {
    throw new Error("Upload not found. Upload via /story/upload-signature first.");
  }

  if (!asset.public_id.startsWith("stories/")) {
    throw new Error("Upload is not a story asset.");
  }

  if (!asset.tags?.includes(`user:${userId}`)) {
    throw new Error("Upload does not belong to this user.");
  }

  const story = await Story.create({
    user: userId,
    caption: body.caption,
    media: {
      publicId: asset.public_id,
      url: asset.secure_url,
      resourceType: asset.resource_type,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
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
