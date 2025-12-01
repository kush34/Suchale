import { IMessage } from "./messageModel";
import mongoose, { Document, Schema } from "mongoose";
export interface IContact {
  userId: mongoose.Types.ObjectId;
  lastMessage: IMessage | null;
}

export interface IUser extends Document {
  username: string;
  fullName?: string;
  bio?: string;

  email: string;
  password: string;

  profilePic: string;
  bannerPic?: string;

  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];

  status: "online" | "offline" | "away" | "busy";

  contacts: IContact[];
  pushSubscription?: Record<string, any> | null;
  blockedUsers?: mongoose.Types.ObjectId[];
  groups?: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "https://placehold.co/300x300",
    },

    bannerPic: {
      type: String,
      default: "https://placehold.co/800x300",
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },

    contacts: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          index: true,
        },
        lastMessage: {
          type: Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],

    pushSubscription: {
      type: Schema.Types.Mixed,
      default: null,
    },

    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
  },
  { timestamps: true }
);


const User = mongoose.model<IUser>("User", userSchema);

export default User;
