import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  media?: string[];
  engagement: {
    like: number;
    comments: number;
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
    engagement: {
      like: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

postSchema.index({ "engagement.like": -1 });
postSchema.index({ "engagement.comments": -1 });

postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
