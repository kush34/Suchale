import mongoose from 'mongoose';
import type { Document } from 'mongoose';


export interface IMessage extends Document{
    fromUser: string;
    toUser?: string;
    groupId?: mongoose.Types.ObjectId;
    content: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
    fromUser: {
        type: String,
        required: true,
    },
    toUser: {
        type: String,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId
    },
    content: String,
    read: { type: Boolean, default: false }
}, {
    timestamps: true,
})

messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ fromUser: 1, toUser: 1, createdAt: -1 });
const Message = mongoose.model('Message', messageSchema);

export default Message;