import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  media: string[];

  mentions: {
    userId: mongoose.Types.ObjectId;
    username: string;
  }[];

  hashtags: string[];

  engagement: {
    likes: {
      user: mongoose.Types.ObjectId;
      likedAt: Date;
    }[];

    comments: {
      userId: mongoose.Types.ObjectId;
      content: string;
      createdAt: Date;
    }[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    media: [
      {
        type: String,
        trim: true,
      },
    ],

    mentions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        username: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    engagement: {
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          likedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      comments: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          content: {
            type: String,
            required: true,
            trim: true,
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Feed queries
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

// Search
postSchema.index({ content: "text" });

// Trending hashtags
postSchema.index({ hashtags: 1 });

// Mentions
postSchema.index({ "mentions.username": 1 });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
