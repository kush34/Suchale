import React, { useEffect, useState, useRef } from 'react';
import ChatImageViewer from './ChatImageViewer';
import VideoViewer from './VideoViewer';
import FileViewer from './FileViewer';
import { Check, CheckCheck, Pen, Trash } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/Components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { toast } from 'sonner';
import api from '@/utils/axiosConfig';
import { formatChatTime } from './GroupCard';

const MsgCard = ({ msg, currentUser }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState(msg.content);
    const holdTimer = useRef(null);

    const getDate = (iso) => {
        const date = new Date(iso);
        return date.toISOString().split("T")[0];
    };
    const onEdit = async (messageId, udpatedContent) => {
        console.log(messageId, udpatedContent);
        if (msg.isDeleted) {
            toast.error("Cannot Edit Deleted Msg.")
            return;
        }
        try {
            const response = await api.post("/message/updateMsg", { messageId, udpatedContent })
            if (response.status === 200) {
                msg.content = udpatedContent;
                msg.isEdited = true;
                toast.success("Edited the message.")
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || "Could not edit the message.")
        }
    }
    const onDelete = async (messageId) => {
        if (msg.isDeleted) {
            toast.error("This is already deleted Msg.")
            return;
        }
        console.log(messageId);
        try {
            const response = await api.delete(`/message/deleteMsg/${messageId}`,)
            if (response.status === 200) {
                msg.content = "Msg Deleted By User";
                msg.isDeleted = true;
                toast.success("Deleted the message.")
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || "Could not delete the message.")
        }
    }
    const handleMouseDown = () => {
        if (msg.fromUser !== currentUser) return;
        holdTimer.current = setTimeout(() => {
            setShowMenu(true);
        }, 300);
    };
    const reactToMessage = async (emoji) => {
        try {
            const res = await api.post(`/message/reactToMsg`, {
                messageId: msg._id,
                emoji,
            });
            console.log("Reaction sent:", res.data);
        } catch (err) {
            console.error("Failed to react:", err.response?.data || err.message);
            toast.error("Could not React to the Msg")
        }
    };
    const handleMouseUp = () => {
        clearTimeout(holdTimer.current);
    };

    const handleCloseMenu = () => setShowMenu(false);

    const handleEditClick = () => {
        if (msg.isDeleted) {
            toast.error("Cannot Edit Deleted Msg.")
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
            className="relative gap-2 items-center select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Right-click menu (reactions) */}
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="w-full cursor-pointer">
                        <div className="msgContent text-xl">
                            {
                                msg.content?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                    <ChatImageViewer src={msg.content} />
                                ) : msg.content?.match(/\.(mp4)$/i) ? (
                                    <VideoViewer src={msg.content} />
                                ) : msg.content?.match(/\.(pdf|docx|txt|rtf|odt)$/i) ? (
                                    <FileViewer src={msg.content} />
                                ) : (
                                    <div className={`flex justify-start text-lg ${msg.isDeleted && "opacity-60 italic text-red-100"}`}>
                                        {msg.content}
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex text-[10px] justify-end gap-2">
                            <div className="text-zinc-500">
                                {msg.isEdited && <span className="mx-3">Edited</span>}
                                {formatChatTime(msg.createdAt)}
                            </div>
                            <span className="text-white">
                                {msg.read ? <CheckCheck size={16} /> : <Check size={16} />}
                            </span>
                        </div>
                    </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="flex">
                    <ContextMenuItem onClick={() => reactToMessage("🔥")}>🔥</ContextMenuItem>
                    <ContextMenuItem onClick={() => reactToMessage("❤️")}>❤️</ContextMenuItem>
                    <ContextMenuItem onClick={() => reactToMessage("😭")}>😭</ContextMenuItem>
                    <ContextMenuItem onClick={() => reactToMessage("☠️")}>☠️</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Left-hold menu (edit/delete) */}
            {showMenu && msg.fromUser === currentUser && (
                <div
                    onMouseLeave={handleCloseMenu}
                    className="flex absolute right-0 top-0 bg-white text-black text-sm rounded-md shadow-md p-2 z-50"
                >
                    <div
                        onClick={handleEditClick}
                        className="hover:bg-zinc-200 px-3 py-1 rounded cursor-pointer"
                    >
                        <Pen />
                    </div>
                    <div
                        onClick={() => { onDelete(msg._id); handleCloseMenu(); }}
                        className="hover:bg-zinc-200 text-red-500 px-3 py-1 rounded cursor-pointer"
                    >
                        <Trash />
                    </div>
                </div>
            )}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Message</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                    />
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MsgCard;
