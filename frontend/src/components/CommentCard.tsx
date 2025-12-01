import React from "react";

interface CommentCardProps {
    username: string;
    profilePic: string;
    content: string;
    createdAt: Date | string;
}

const CommentCard = ({ username, profilePic, content, createdAt }: CommentCardProps) => {
    return (
        <div className="flex gap-3 py-3 border-b">
            <img
                src={profilePic || "https://placehold.co/50"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex flex-col">
                <span className="font-semibold">{username}</span>
                <span className="text-sm text-gray-700">{content}</span>
                <span className="text-xs text-gray-400">
                    {new Date(createdAt).toLocaleString()}
                </span>
            </div>
        </div>
    );
};

export default CommentCard;
