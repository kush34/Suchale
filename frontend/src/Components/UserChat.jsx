import React, { useContext, useEffect, useRef, useState } from "react";
import Loader1 from '../loaders/Loader1';
import { ImagePlay, SmilePlus, SendHorizontal, Undo2 } from "lucide-react";
import EmojiPicker from './EmojiPicker';
import { ChatContext } from "../Store/ChatContext";
import MsgCard from "./MsgCard";
import { useUser } from "../Store/UserContext";
import socket from "../utils/socketService";
import api from "../utils/axiosConfig";
import { ThemeContext } from "../Store/ThemeContext";
import LineLoader from "../loaders/LineLoader";
import { toast } from "sonner";

const UserChat = () => {
  const { chat, setChat, chatArr, setChatArr, hasMore, chatDivRef, getMessages, loading, setLoading, groupFlag, ViewChatInfo, infoWindow, sendMsg } = useContext(ChatContext);
  const { theme } = useContext(ThemeContext);
  const { user } = useUser();

  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverTopbar, setHoverTopbar] = useState(false);

  const mediaInpRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mouse tracking for info window
  useEffect(() => {
    const handleMouseMove = (e) => {
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

  const handleEmojiClick = (emojiData) => setMessage((prev) => prev + emojiData);


  const mediaTrigger = () => mediaInpRef.current.click();

  const sendMedia = async (e) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("toUser", chat?.username);

    try {
      const res = await api.post("/message/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        setChatArr((prev) => [
          ...prev,
          { fromUser: user.username, toUser: chat?.username, content: res.data.url },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };


  useEffect(() => {
    socket.on("typing", ({ from }) => {
      if (from === chat.username) setIsTyping(true);
    });
    socket.on("stopTyping", ({ from }) => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
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
  }, [chatArr]);



  if (!chat) return <div className="flex justify-center items-center w-3/4 text-zinc-500">Please select chat to view messages</div>;

  return (
    <div className={`shadow-2xl ${theme ? "bg-white text-black" : "bg-zinc-900 text-white"} flex flex-col justify-between md:rounded-2xl md:w-full h-full overflow-none`}>
      <span
        onClick={ViewChatInfo}
        onMouseEnter={() => setHoverTopbar(true)}
        onMouseLeave={() => setHoverTopbar(false)}
        className={`${theme ? "bg-black text-white" : "bg-zinc-500"} profile-username-typingindicator-back_btn py-3 px-5 flex items-center justify-between md:rounded-t-2xl font-medium text-2xl`}
      >
        <div className="img">
          <img className="rounded-full w-15 h-15" src={chat?.profilePic || "https://placehold.co/400x400"} alt="" />
        </div>
        <div>
          {chat?.username || chat?.name}
          {isTyping && <div className="text-green-500 text-sm">typing...</div>}
        </div>
        <div className="md:hidden back_btn">
          <button className="text-sm cursor-pointer" onClick={() => setChat(null)}><Undo2 /></button>
        </div>
      </span>

      {loading && <LineLoader />}

      <div ref={chatDivRef} className="chats-msgs flex flex-col h-full w-full overflow-y-scroll no-scrollbar">
        {chatArr && chatArr.length > 0 && !loading && (
          <>
            {chatArr.map((msg) => (
              <div key={msg?._id} className={`w-full flex ${msg.fromUser === user.username ? "justify-end" : "justify-start"}`}>
                <span className={`${msg.fromUser === user.username ? "bg-zinc-800" : "bg-black"} w-fit max-w-[75%] text-white rounded m-2 px-3 py-2`}>
                  <MsgCard msg={msg} />
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

      <div className="flex media-emojis-textbar-sendbtn">
        <div className="w-1/7 items-center flex justify-evenly">
          <div onClick={mediaTrigger} className="cursor-pointer text-zinc-700 flex items-center justify-center hover:text-zinc-400 ease-in duration-100 hover:scale-110">
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
              className="cursor-pointer text-zinc-700 flex items-center justify-center hover:text-zinc-400 ease-in duration-100 hover:scale-110"
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
            className={`${theme ? "bg-zinc-100 focus:bg-zinc-300" : "bg-zinc-800 focus:bg-zinc-800"} w-full outline-none rounded px-2 py-1`}
            placeholder="type your message here"
          />
        </div>
        <div onClick={() => { sendMsg(message); setMessage(""); }} className="cursor-pointer text-zinc-700 flex items-center justify-center w-1/10 ease-in duration-100 hover:scale-110">
          <SendHorizontal />
        </div>
      </div>

      {hoverTopbar && infoWindow && infoWindow.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            backgroundColor: theme ? "#fff" : "#000",
            color: theme ? "#000" : "#fff",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            zIndex: 1000,
            width: "200px",
          }}
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
