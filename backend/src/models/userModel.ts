import mongoose from "mongoose";
import { IMessage } from "./messageModel";

export interface IContact {
  userId: mongoose.Types.ObjectId;
  lastMessage: IMessage | null;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePic: string;
  status: "online" | "offline" | "away" | "busy";
  contacts: IContact[];
  pushSubscription?: Record<string, any> | null;
  blockedUsers?: mongoose.Types.ObjectId[];
  groups?: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String, // URL to the profile picture
      default: "https://placehold.co/400x400",
    },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },
    // lastSeen: {
    //   type: Date,
    //   default: Date.now,
    // },
    contacts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      },
    ],
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    // socketId: {
    //   type: String, // For real-time tracking with Socket.IO
    //   default: null,
    // },
    // isVerified: {
    //   type: Boolean,
    //   default: false, // Email or phone verification
    // },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
