import React, { useContext, useEffect, useRef, useState } from "react";
import Loader1 from '../loaders/Loader1';
import { ImagePlay, SmilePlus, SendHorizontal, Undo2, Search } from "lucide-react";
import EmojiPicker from '@/components/EmojiPicker';
import { ChatContext } from "../Store/ChatContext";
import MsgCard from "@/components/MsgCard";
import { useUser } from "../Store/UserContext";
import socket from "../utils/socketService";
import api from "../utils/axiosConfig";
import LineLoader from "../loaders/LineLoader";
import { toast } from "sonner";
import { Message } from "@/types";
import Profile from "./Feed/Post/Profile";

const UserChat = () => {
  const chatCtx = useContext(ChatContext);
  if (!chatCtx) return null;
  const { chat, setChat, chatArr, setChatArr, hasMore, chatDivRef, getMessages, loading, setLoading, groupFlag, ViewChatInfo, infoWindow, sendMsg } = chatCtx;

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

  const handleEmojiClick = (emojiData: string) => setMessage((prev) => prev + emojiData);


  const mediaTrigger = () => {
    if (mediaInpRef.current) mediaInpRef.current.click();
  }

  const sendMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files == null || !files[0]) return;
    if (!chat) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("toUser", chat?.username);

    try {
      const res = await api.post("/message/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        setChatArr((prev) => [
          ...prev,
          { fromUser: user.username, toUser: chat?.username, content: res.data.url } as Message,
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  const updateReaction = (updatedMsg: Message) => {
    setChatArr(prev =>
      prev.map(m =>
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
    socket.on("emojiReactionDirect", handleDirect)
    socket.on("emojiReactionGroup", handleGroup)
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
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);



  if (!chat) return <div className="flex justify-center items-center w-3/4 text-zinc-500">Please select chat to view messages</div>;

  return (
    <div className={`shadow-2xl bg-card text-card-foreground flex flex-col justify-between md:w-full h-full overflow-none`}>
      <span
        onClick={ViewChatInfo}
        onMouseEnter={() => setHoverTopbar(true)}
        onMouseLeave={() => setHoverTopbar(false)}
        className={`bg-secondary text-secondary-foreground profile-username-typingindicator-back_btn py-3 px-5 flex items-center gap-2 font-medium text-2xl`}
      >
        <Profile username={chat.username || chat.name} src={chat?.profilePic}/>
        <div>
          {isTyping && <div className="text-green-500 text-sm">typing...</div>}
        </div>
        <div className="xl:hidden back_btn">
          <button className="text-sm cursor-pointer" onClick={() => setChat(null)}><Undo2 /></button>
        </div>
      </span>

      {loading && <LineLoader />}

      <div ref={chatDivRef} className="chats-msgs flex flex-col h-full w-full overflow-y-scroll no-scrollbar">
        {chatArr && chatArr.length > 0 && (
          <>
            {chatArr.map((msg) => (
              <div key={msg?._id} className={`w-full flex ${msg.fromUser === user.username ? "justify-end" : "justify-start"}`}>
                <span className={`${msg.fromUser === user.username ? "bg-zinc-800" : "bg-black"} w-fit max-w-[75%] text-white rounded m-2 px-3 py-2`}>
                  <MsgCard msg={msg} currentUser={user.username} />
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        {(
          !loading && chatArr?.length == 0 &&
          <div className="flex justify-center items-center mt-10 text-zinc-500">No messages found</div>
        )}
      </div>

      <div className={`flex media-emojis-textbar-sendbtn bg-muted text-muted-foreground py-2`}>
        <div className="w-1/7 items-center flex justify-evenly">
          <div onClick={mediaTrigger} className="cursor-pointer flex items-center justify-center hover:text-zinc-400 ease-in duration-100 hover:scale-110">
            <ImagePlay />
            <input ref={mediaInpRef} onChange={sendMedia} type="file" className="hidden" />
          </div>
          <div className="relative">
            {showPicker && (
              <div className="absolute bottom-full mb-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <button
              className="cursor-pointer flex items-center justify-center ease-in duration-100 hover:scale-110"
              onClick={() => setShowPicker(!showPicker)}
            >
              <SmilePlus />
            </button>
          </div>
        </div>
        <div className="w-3/4 flex items-center justify-center mb-2">
          <input
            value={message}
            onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMsg(message);
                setMessage("");
              }
            }}
            type="text"
            className={` w-full outline-none rounded px-2 py-1`}
            placeholder="type your message here"
          />
        </div>
        <div onClick={() => { sendMsg(message); setMessage(""); }} className="cursor-pointer flex items-center justify-center w-1/10 ease-in duration-100 hover:scale-110">
          <SendHorizontal />
        </div>
      </div>

      {hoverTopbar && infoWindow && infoWindow.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            padding: "0.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
            width: "200px",
          }}
          className="bg-popover text-popover-foreground shadow p-2 rounded"
        >
          <div className="font-bold mb-2">Members</div>
          {infoWindow.map((member) => (
            <div key={member._id} className="flex items-center mb-1">
              <img className="w-8 h-8 rounded-full mr-2" src={member.profilePic} alt={member.username} />
              <span>{member.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserChat;
