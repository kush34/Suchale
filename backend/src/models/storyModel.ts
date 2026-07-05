import mongoose, { Schema, Document } from "mongoose";

export interface IStory extends Document {
  user: mongoose.Types.ObjectId;

  media: {
    publicId: string;
    url: string;
    resourceType: "image" | "video";
    format?: string;
    width?: number;
    height?: number;
    duration?: number; // Only for videos
  };

  caption?: string;

  viewers: mongoose.Types.ObjectId[];

  createdAt: Date;
  expiresAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    media: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      resourceType: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      format: String,
      width: Number,
      height: Number,
      duration: Number,
    },

    caption: {
      type: String,
      maxlength: 300,
      default: "",
    },

    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: {
        expires: 0, // TTL index
      },
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export default mongoose.model<IStory>("Story", storySchema);
