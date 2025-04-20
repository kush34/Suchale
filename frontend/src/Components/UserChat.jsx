import React, { useContext, useEffect, useRef, useState } from "react";
import { ImagePlay } from "lucide-react";
import { SendHorizontal } from "lucide-react";
import { ChatContext } from "../Store/ChatContext";
import MsgCard from "./MsgCard";
import { useUser } from "../Store/UserContext";
import socket from "../utils/socketService";
import api from "../utils/axiosConfig";
const UserChat = () => {
  const { chat, chatArr, setChatArr } = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
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
  };

  useEffect(() => {
    socket.emit("addUser", user?.username);
  }, [user]);
  useEffect(() => {
    socket.on("sendMsg", (message) => {
      // Append to chat window
      // console.log('New message:', message);
      setChatArr((prev) => [...prev, message]);
    });

    return () => socket.off("sendMsg");
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
    <div className="bg-white flex flex-col justify-between rounded-t-2xl w-3/4 m-5 h-9.5/10">
      <div className="top py-3 px-5 flex items-center justify-between rounded-t-2xl font-medium text-2xl bg-black text-white">
        <div className="img">
          <img
            className="rounded-full w-15 h-15"
            src={chat?.profilePic || "https://placehold.co/400x400"}
            alt=""
          />
        </div>
        <div className=" ">{chat?.username}</div>
      </div>
      <div className="flex flex-col h-full w-full overflow-y-scroll">
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
                        ? "bg-zinc-700"
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
      </div>
      <div className="flex justify-evenly m-3 ">
        <div className="cursor-pointer text-zinc-900 w-1/4  flex items-center justify-center hover:text-black ease-in duration-100 hover:scale-110">
          <ImagePlay />
        </div>
        <div className=" w-3/4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            className="focus:bg-zinc-300 w-full bg-zinc-200 outline-none rounded px-3 py-2"
            placeholder="type your message here"
            name=""
            id=""
          />
        </div>
        <div
          onClick={sendMessage}
          className=" cursor-pointer text-zinc-900 flex  items-center justify-center w-1/4 hover:text-black ease-in duration-100 hover:scale-110"
        >
          <SendHorizontal />
        </div>
      </div>
    </div>
  );
};

export default UserChat;
