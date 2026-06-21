import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../Store/ChatContext";
import { useUser } from "../Store/UserContext";
import socket from "../utils/socketService";
import api from "../utils/axiosConfig";
import LineLoader from "../loaders/LineLoader";
import { Message } from "@/types";
import MsgBar from "@/components/user-chat/msg-bar";
import ToBottomBtn from "@/components/user-chat/to-bottom-chat.btn";
import TopBar from "@/components/user-chat/top-bar";
import ChatDisplay from "@/components/user-chat/chat-display";
import HoverCard from "@/components/user-chat/HoverCard";
import { trackEvent } from "@/lib/posthog";

const UserChat = () => {
  const chatCtx = useContext(ChatContext);
  if (!chatCtx) return null;
  const {
    chat,
    setChat,
    chatArr,
    setChatArr,
    hasMore,
    chatDivRef,
    getMessages,
    loading,
    setLoading,
    groupFlag,
    ViewChatInfo,
    infoWindow,
    sendMsg,
  } = chatCtx;

  const userCtx = useUser();
  if (!userCtx) return null;
  const user = userCtx.user;
  if (!user) return null;

  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverTopbar, setHoverTopbar] = useState(false);

  const mediaInpRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const [toBottomBtnFlag, setToBottonBtnFlag] = useState<boolean>(false);

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Mouse tracking for info window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleTyping = () => {
    socket.emit("typing", { to: chat?.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: chat?.username });
    }, 2000);
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };



  const mediaTrigger = () => {
    if (mediaInpRef.current) mediaInpRef.current.click();
  };
  const uploadToCloudinary = async (file: File) => {
    try {
      // 1. Get pre-signed signature from backend
      const { data } = await api.get("/post/preSignedUrl");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", data.apiKey);
      formData.append("timestamp", data.timestamp);
      formData.append("signature", data.signature);
      formData.append("folder", data.folder);

      // 2. Upload to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await uploadRes.json();

      if (!result.secure_url) throw new Error("Upload failed");

      return result.secure_url;
    } catch (err) {
      throw err;
    }
  };

  const sendMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (!files || !files[0] || !chat) return;

    setLoading(true);

    try {
      const file = files[0];

      // 1. Upload directly to Cloudinary
      const mediaUrl = await uploadToCloudinary(file);

      // 2. Send URL to backend
      const res = await api.post("/message/media", {
        toUser: chat.username,
        mediaUrl,
      });

      if (res.status === 200) {
        setChatArr((prev) => [
          ...prev,
          {
            fromUser: user.username,
            toUser: chat.username,
            content: mediaUrl,
          } as Message,
        ]);
        trackEvent("file_shared_in_chat", {
          chat_type: chat.username ? "direct" : "group",
          recipient: chat.username || chat.name,
          file_type: file.type,
        });
      }
    } catch (err) {
      console.error("Send media failed:", err);
    } finally {
      setLoading(false);
      target.value = "";
    }
  };

  const updateReaction = (updatedMsg: Message) => {
    setChatArr((prev) =>
      prev.map((m) =>
        String(m._id) === String(updatedMsg._id) ? updatedMsg : m
      )
    );
  };

  useEffect(() => {
    socket.on("typing", ({ from }) => {
      if (!chat) return;
      if (from === chat.username) setIsTyping(true);
    });
    const handleDirect = (msg: Message) => updateReaction(msg);
    const handleGroup = (msg: Message) => updateReaction(msg);
    socket.on("stopTyping", ({ from }) => setIsTyping(false));
    socket.on("emojiReactionDirect", handleDirect);
    socket.on("emojiReactionGroup", handleGroup);
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("emojiReactionDirect");
      socket.off("emojiReactionGroup");
    };
  }, [chat]);

  useEffect(() => {
    const div = chatDivRef.current;
    if (!div) return;

    const handleScroll = () => {
      if (div.scrollTop === 0 && hasMore) {
        const scrollHeightBefore = div.scrollHeight;
        getMessages(true).then(() => {
          setTimeout(() => {
            div.scrollTop = div.scrollHeight - scrollHeightBefore;
          }, 0);
        });
      }
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [chatDivRef, hasMore, getMessages]);

  useEffect(() => {
    const div = chatDivRef.current;
    if (!div) return;

    const handleScroll = () => {
      const isNearBottom =
        div.scrollHeight - div.scrollTop - div.clientHeight < 50;

      setToBottonBtnFlag(!isNearBottom);
    };

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [chatDivRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  if (!chat)
    return (
      <div className="flex justify-center items-center w-3/4 text-zinc-500">
        Please select chat to view messages
      </div>
    );

  return (
    <div
      className={`shadow-2xl bg-card text-card-foreground flex flex-col justify-between md:w-full h-full overflow-none`}
    >
      <TopBar isTyping={isTyping} chat={chat} setChat={setChat} ViewChatInfo={ViewChatInfo} setHoverTopbar={setHoverTopbar} />
      {loading && <LineLoader />}
      <ChatDisplay chatDivRef={chatDivRef} chatArr={chatArr} user={user} loading={loading} messagesEndRef={messagesEndRef} />
      <ToBottomBtn handleScrollToBottom={handleScrollToBottom} toBottomBtnFlag={toBottomBtnFlag} />
      <MsgBar sendMsg={sendMsg} message={message} setMessage={setMessage} sendMedia={sendMedia} mediaInpRef={mediaInpRef} mediaTrigger={mediaTrigger} handleEmojiClick={handleEmojiClick} handleTyping={handleTyping} showPicker={showPicker} setShowPicker={setShowPicker} />
      <HoverCard hoverTopbar={hoverTopbar} infoWindow={infoWindow} mousePos={mousePos}/>
    </div>
  );
};

export default UserChat;
