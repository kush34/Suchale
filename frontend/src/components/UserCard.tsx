import { useContext } from "react";
import { Infinity } from "lucide-react";

import { Chat } from "@/types";
import { ChatContext } from "../Store/ChatContext";
import { trackEvent } from "@/lib/posthog";
import { formatChatTime } from "./GroupCard";

type ChatCardProps = {
  chatItem: Chat;
};

const ChatCard = ({ chatItem }: ChatCardProps) => {
  const chatCtx = useContext(ChatContext);

  if (!chatCtx) return null;

  const { chat, setChat, setGroupFlag } = chatCtx;

  const isGroup = !!chatItem.isGroup;

  const title = isGroup ? chatItem.name : chatItem.username;

  const handleClick = () => {
    const isSameChat = isGroup
      ? chat?._id === chatItem._id
      : chat?.username === chatItem.username;

    if (isSameChat) return;

    setChat(chatItem);
    setGroupFlag(isGroup);

    trackEvent("chat_opened", {
      chat_type: isGroup ? "group" : "direct",
      ...(isGroup
        ? {
            group_id: chatItem._id,
            group_name: chatItem.name,
          }
        : {
            username: chatItem.username,
          }),
    });
  };

  return (
    <div
      onClick={handleClick}
      className="flex justify-between items-center gap-3 pb-3 border-b cursor-pointer hover:bg-zinc-400 hover:shadow-xl transition-all duration-150"
    >
      <div className="flex gap-3 items-center">
        <div className="ml-2 mt-2 flex items-end">
          <img
            src={chatItem.profilePic}
            alt={title}
            className="w-12 h-12 rounded-full"
          />

          {!isGroup && chatItem.status === "Online" && (
            <div className="w-2 h-2 rounded-full bg-green-500 -ml-2 mb-1" />
          )}
        </div>

        <div className="mx-2">
          <div className="text-xl font-medium">{title}</div>

          <div className="text-sm font-light text-zinc-500 truncate max-w-48">
            {chatItem.lastMessage?.content ?? "No messages"}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-center gap-2 pr-2">
        {chatItem.lastMessage?.createdAt ? (
          <span className="text-sm text-zinc-500">
            {formatChatTime(chatItem.lastMessage.createdAt)}
          </span>
        ) : (
          <Infinity
            size={16}
            strokeWidth={1}
            className="text-zinc-500"
          />
        )}

        {chatItem.unreadCount > 0 && (
          <div className="min-w-5 h-5 px-1 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">
            {chatItem.unreadCount > 99 ? "99+" : chatItem.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatCard;