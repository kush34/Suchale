import { useState, useRef, useEffect, useContext } from "react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

import { toast } from "sonner";
import api from "@/utils/axiosConfig";
import { Message } from "@/types";
import EmojiReactions from "./EmojiReactions";
import { ChatContext } from "@/Store/ChatContext";
import EditMsgDialog from "./EditMsgDialog";
import EmojiBar from "./EmojiBar";
import MsgContent from "./MsgContent";
import MsgMeta from "./MsgMeta";
import MsgActions from "./MsgActions";

type MsgCardProps = {
  msg: Message;
  currentUser: string;
};

const MsgCard = ({ msg, currentUser }: MsgCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(msg.content);
  const chatCtx = useContext(ChatContext);
  if (!chatCtx) return null;
  const holdTimer = useRef<number | null>(null);

  const getDate = (iso: string) => {
    const date = new Date(iso);
    return date.toISOString().split("T")[0];
  };
  const onEdit = async (messageId: string, udpatedContent: string) => {
    console.log(messageId, udpatedContent);
    if (msg.isDeleted) {
      toast.error("Cannot Edit Deleted Msg.");
      return;
    }
    try {
      const response = await api.post("/message/updateMsg", {
        messageId,
        udpatedContent,
      });
      if (response.status === 200) {
        msg.content = udpatedContent;
        msg.isEdited = true;
        toast.success("Edited the message.");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Could not edit the message.");
    }
  };
  const onDelete = async (messageId: string) => {
    if (msg.isDeleted) {
      toast.error("This is already deleted Msg.");
      return;
    }
    console.log(messageId);
    try {
      const response = await api.delete(`/message/deleteMsg/${messageId}`);
      if (response.status === 200) {
        msg.content = "Msg Deleted By User";
        msg.isDeleted = true;
        toast.success("Deleted the message.");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Could not delete the message.");
    }
  };
  const handleMouseDown = () => {
    if (msg.fromUser !== currentUser) return;
    if (holdTimer === null) return;
    holdTimer.current = window.setTimeout(() => {
      setShowMenu(true);
    }, 300);
  };
  const reactToMessage = async (emoji: string) => {
    try {
      const res = await api.post(`/message/reactToMsg`, {
        messageId: msg._id,
        emoji,
      });
      if (res.data.data.reactions) {
        console.log(res.data.data.reactions);
        chatCtx.setChatArr((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, reactions: res.data.data.reactions } : m
          )
        );
      }
    } catch (err) {
      toast.error("Could not React to the Msg");
    }
  };

  const handleMouseUp = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleCloseMenu = () => setShowMenu(false);

  const handleEditClick = () => {
    if (msg.isDeleted) {
      toast.error("Cannot Edit Deleted Msg.");
      return;
    }
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (newContent.trim() && newContent !== msg.content) {
      onEdit(msg._id, newContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className="relative  items-center select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Right-click menu (reactions) */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="w-full cursor-pointer">
            <MsgContent msg={msg} />
          </div>
        </ContextMenuTrigger>
        <EmojiBar onReact={reactToMessage} />
      </ContextMenu>
      <div className="absolute -bottom-5 -left-3 z-20">
        {msg.reactions && msg.reactions.length > 0 && (
          <EmojiReactions reactions={msg.reactions} />
        )}
      </div>
      {/* Left-hold menu (edit/delete) */}
      {showMenu && msg.fromUser === currentUser && (
        <MsgActions
          msg={msg}
          onDelete={onDelete}
          handleCloseMenu={handleCloseMenu}
          handleEditClick={handleEditClick}
        />
      )}
      <EditMsgDialog
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        newContent={newContent}
        setNewContent={setNewContent}
        handleSaveEdit={handleSaveEdit}
      />
    </div>
  );
};

export default MsgCard;
