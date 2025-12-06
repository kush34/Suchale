import React from "react";
import { formatChatTime } from "./GroupCard";
import Profile from "./Feed/Post/Profile";

interface CommentCardProps {
    username: string;
    profilePic: string;
    content: string;
    createdAt: string;
}

const CommentCard = ({ username, profilePic, content, createdAt }: CommentCardProps) => {
    const date = formatChatTime(createdAt);
    return (
        <div className="flex gap-3 py-3 border-b justify-between">
            <div className=" gap-2 items-center">
                <Profile username={username} src={profilePic} />

                <div className="flex flex-col mt-2">
                    <span className="text-lg">{content}</span>
                </div>
            </div>
            <span className="text-xs text-secondary-foreground">
                {date}
            </span>
        </div>
    );
};

export default CommentCard;
