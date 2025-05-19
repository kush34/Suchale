import React, { useContext, useEffect, useRef, useState } from "react";
import Loader1 from '../loaders/Loader1'
import { ImagePlay } from "lucide-react";
import { SmilePlus } from 'lucide-react';
import EmojiPicker from './EmojiPicker'
import { SendHorizontal } from "lucide-react";
import { ChatContext } from "../Store/ChatContext";
import MsgCard from "./MsgCard";
import { useUser } from "../Store/UserContext";
import socket from "../utils/socketService";
import api from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../Store/ThemeContext";
const UserChat = () => {
  const { chat,setChat, chatArr, setChatArr } = useContext(ChatContext);
  const {theme} = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  const { user } = useUser();
  const [showPicker, setShowPicker] = useState(false);
  const [isTyping,setIsTyping] = useState(false);
  const mediaInpRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const handleTyping = () => {
    // console.log("typing logger handleTyping function ...");
    socket.emit("typing", { to: chat?.username });

    // Optional: debounce so you're not emitting too frequently
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: chat?.username });
    }, 2000); // stop typing after 2s of inactivity
  };
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData);
  };
  const sendMessage = async () => {
    setLoading(true);
    const response = await api.post("/message/send", {
      toUser: chat?.username,
      content: message,
    });
    if (response.status == 200) {
      setChatArr((prev) => [
        ...prev,
        {
          fromUser: user.username,
          toUser: chat?.username,
          content: message,
        },
      ]);
    }
    setMessage("");
    setLoading(false);
  };
  const mediaTrigger = ()=>{
    mediaInpRef.current.click();
  }
  const sendMedia = async (e) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("toUser", chat?.username); 
  
    try {
      const res = await api.post("/message/media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status == 200) {
        setChatArr((prev) => [
          ...prev,
          {
            fromUser: user.username,
            toUser: chat?.username,
            content: res.data.url,
          },
        ]);
      }
      // console.log("Uploaded URL:", res.data.url);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    socket.emit("addUser", user?.username);
    socket.emit("readMessages",({fromUser:user?.username,toUser:chat?.username}));
  }, [user]);
  useEffect(() => {
    socket.on("sendMsg", (message) => {
      if(message.fromUser == chat.username){
        setChatArr((prev) => [...prev, message]);
        
      }
    });
    socket.on("messagesRead", ({ fromUser }) => {
      setChatArr((prev) =>
        prev.map((msg) =>
          msg.toUser === fromUser ? { ...msg, read: true } : msg
        )
      );
    });
    
    return () => {
      socket.off("sendMsg");
      socket.off("messagesReadBy");
    }
  }, []);
  useEffect(() => {
    socket.on("typing", ({ from }) => {
      if(from == chat.username)
      setIsTyping(true);
    });
  
    socket.on("stopTyping", ({ from }) => {
      setIsTyping(false);
    });
  
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatArr]);
  if (!chat) {
    return (
      <div className="flex justify-center items-center w-3/4 text-zinc-500">
        Please select chat to view messages
      </div>
    );
  }
  return (
    <div className={`shadow-2xl ${theme ? "bg-white text-black" : "bg-zinc-900 text-white"} flex flex-col justify-between md:rounded-t-2xl md:w-full h-full overflow-none`}>
      <div className={` ${theme ? "bg-black text-white" : "bg-zinc-500"} profile-username-typingindicator-back_btn py-3 px-5 flex items-center justify-between md:rounded-t-2xl font-medium text-2xl`}>
        <div className="img">
          <img
            className="rounded-full w-15 h-15"
            src={chat?.profilePic || "https://placehold.co/400x400"}
            alt=""
          />
        </div>
        <div className=" ">
          {chat?.username}
          {isTyping && <div className="text-green-500 text-sm">typing...</div>}
          </div>
          <div className="md:hidden back_btn">
            <button className="text-sm cursor-pointer" onClick={()=>setChat(null)}>Back</button>
          </div>
      </div>
      <div className="chats-msgs flex flex-col h-full w-full overflow-y-scroll no-scrollbar">
        {chatArr ? (
          <>
            {chatArr.map((msg) => {
              return (
                <div
                  key={msg?._id}
                  className={`w-full flex ${
                    msg.fromUser === user.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <span
                    className={`${
                      msg.fromUser === user.username
                        ? "bg-zinc-800"
                        : "bg-black"
                    } w-fit max-w-[75%] text-white rounded m-2 px-3 py-2`}
                  >
                    <MsgCard msg={msg} />
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div>No messages found</div>
        )}
        {
          loading && <Loader1/>
        }
      </div>
      <div className="flex media-emojis-textbar-sendbtn">
        <div className="w-1/7 items-center flex justify-evenly">
          <div onClick={mediaTrigger} className="cursor-pointer text-zinc-700 flex items-center justify-center hover:text-zinc-400 ease-in duration-100 hover:scale-110">
            <ImagePlay />
            <div><input ref={mediaInpRef} onChange={sendMedia} type="file" className="hidden" /></div>
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
        <div className=" w-3/4 flex items-center justify-center mb-2">
          <input
            value={message}
            onChange={(e) =>{
               setMessage(e.target.value);
               handleTyping();
              }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            type="text"
            className={`${theme ? "bg-zinc-100 focus:bg-zinc-300":"bg-zinc-800 focus:bg-zinc-800"} w-full outline-none rounded px-2 py-1`}
            placeholder="type your message here"
            name=""
            id=""
          />
        </div>
        <div
          onClick={sendMessage}
          className=" cursor-pointer text-zinc-700 flex  items-center justify-center w-1/10  ease-in duration-100 hover:scale-110"
        >
          <SendHorizontal />
        </div>
      </div>
    </div>
  );
};

export default UserChat;
