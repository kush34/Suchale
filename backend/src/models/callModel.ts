import mongoose from "mongoose";
import type { Document } from "mongoose";

export interface ICall extends Document {
  user_id: string;
  to_user_id: string;
  type: "audio" | "video";
  duration: number;
  pickedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

const callSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    to_user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["audio", "video"],
      required: true,
      index: true,
    },
    pickedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Call = mongoose.model<ICall>("Call", callSchema);
export default Call;
