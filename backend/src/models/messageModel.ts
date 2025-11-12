import mongoose from 'mongoose';
import type { Document } from 'mongoose';

const emojiRegex = /\p{Emoji}/u;

export interface IMessage extends Document {
    fromUser: string;
    toUser?: string;
    groupId?: mongoose.Types.ObjectId;
    isEdited: boolean;
    isDeleted: boolean;
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
    isEdited: {
        type: Boolean,
        default: false,
    },
    read: { type: Boolean, default: false },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    reactions: [
        {
            userId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            emoji: {
                type: String,
                validate: {
                    validator: (v: string) => emojiRegex.test(v),
                    message: "Only emojis are allowed",
                },
            },
        }
    ]
}, {
    timestamps: true,
})

messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ fromUser: 1, toUser: 1, createdAt: -1 });
const Message = mongoose.model('Message', messageSchema);

export default Message;