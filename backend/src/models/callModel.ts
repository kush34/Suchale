import mongoose from "mongoose";
import type { Document } from "mongoose";

export interface Icall extends Document {
  user_id: string,
  to_user_id: string,
  duration: number,
  createdAt: string
}

const callSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true,
    ref:'User'
  },
  to_user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true,
    ref:'User'
  },
  duration: {
    type: Number,
    default:0
  }
}, { timestamps: true })


const Call = mongoose.model("Call", callSchema);
export default Call;
