import mongoose from "mongoose";
import type { Document } from "mongoose";

const emojiRegex = /\p{Emoji}/u;

export type MessageType =
    | "text"
    | "image"
    | "video"
    | "audio"
    | "file"
    | "gif"
    | "sticker";

export interface IMessage extends Document {
    fromUser: string;
    toUser?: string;
    groupId?: mongoose.Types.ObjectId;

    type: MessageType;

    content: string;

    media?: {
        provider?: string;
        providerMediaId?: string;

        mediaType?: "gif" | "sticker";

        url: string;
        previewUrl?: string;

        width?: number;
        height?: number;

        mimeType?: string;
    };

    isEdited: boolean;
    isDeleted: boolean;
    read: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const mediaSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            enum: ["giphy", "tenor", "discord", "custom"],
        },

        providerMediaId: String,

        mediaType: {
            type: String,
            enum: ["gif", "sticker"],
        },

        url: String,

        previewUrl: String,

        width: Number,

        height: Number,

        mimeType: String,
    },
    {
        _id: false,
    }
);

const messageSchema = new mongoose.Schema(
    {
        fromUser: {
            type: String,
            required: true,
        },

        toUser: String,

        groupId: mongoose.Schema.Types.ObjectId,

        type: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "audio",
                "file",
                "gif",
                "sticker",
            ],
            default: "text",
        },

        content: {
            type: String,
            default: "",
        },

        media: mediaSchema,

        isEdited: {
            type: Boolean,
            default: false,
        },

        read: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        reactions: [
            {
                userId: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                emoji: {
                    type: String,
                    validate: {
                        validator: (v: string) => emojiRegex.test(v),
                        message: "Only emojis are allowed",
                    },
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ fromUser: 1, toUser: 1, createdAt: -1 });

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;