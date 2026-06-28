import { useContext } from "react";
import { Infinity } from "lucide-react";

import { Chat } from "@/types";
import { ChatContext } from "@/Store/ChatContext";
import { trackEvent } from "@/lib/posthog";
import { formatChatTime } from "./GroupCard";

type ChatCardProps = {
  chatItem: Chat;
};

const ChatCard = ({ chatItem }: ChatCardProps) => {
  const chatCtx = useContext(ChatContext);

  if (!chatCtx) return null;

  const { chat, setChat, setGroupFlag } = chatCtx;

  const isGroup = Boolean(chatItem.isGroup);

  const title = isGroup ? chatItem.name : chatItem.username;

  const isSelected = isGroup
    ? chat?._id === chatItem._id
    : chat?.username === chatItem.username;

  const handleClick = () => {
    if (isSelected) return;

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
    <button
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors duration-150 border-b border-border text-left
      ${
        isSelected
          ? "bg-primary/10"
          : "hover:bg-accent"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={chatItem.profilePic}
          alt={title}
          className="h-12 w-12 rounded-full object-cover"
        />

        {!isGroup && chatItem.status === "Online" && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
        )}
      </div>

      {/* Middle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="truncate text-[15px] font-semibold">
            {title}
          </h3>

          {chatItem.lastMessage?.createdAt ? (
            <span className="ml-3 shrink-0 text-xs text-muted-foreground">
              {formatChatTime(chatItem.lastMessage.createdAt)}
            </span>
          ) : (
            <Infinity
              size={14}
              strokeWidth={1.5}
              className="ml-3 shrink-0 text-muted-foreground"
            />
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {chatItem.lastMessage?.content || "Start a conversation"}
          </p>

          {chatItem.unreadCount > 0 && (
            <div className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {chatItem.unreadCount > 99
                ? "99+"
                : chatItem.unreadCount}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatCard;