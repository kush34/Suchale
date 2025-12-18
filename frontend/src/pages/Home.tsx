import { useContext, useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import UserChat from "@/components/UserChat";
import UserList from "@/components/UserList";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socketService";
import { ChatContext } from "@/Store/ChatContext";
import Loader1 from "../loaders/Loader1";
import { ThemeContext } from "@/Store/ThemeContext";
import { Chat } from "@/types";
import { SocketProvider } from "@/Store/SocketContext";
const Home = () => {
  const navigate = useNavigate();
  const [userChatList, setUserChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const chatCtx = useContext(ChatContext);
  if (!chatCtx) return null;
  const chat = chatCtx?.chat;
  const themeCtx = useContext(ThemeContext);
  if (!themeCtx) return null;
  const theme = themeCtx?.theme;
  const bg = theme ? "bg-zinc-100" : "bg-zinc-900";

  //list of contacts of user

  const getChatList = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/userList");
      // console.log(response.data);
      setUserChatList(response.data.response);
      setLoading(false);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    getChatList();
  }, []);
  useEffect(() => {
    function friendOffline(username: string) {
      setUserChatList((prevList) =>
        prevList.map((user) =>
          user.username === username ? { ...user, status: "offline" } : user
        )
      );
    }
    function friendOnline(username: string) {
      setUserChatList((prevList) =>
        prevList.map((user) =>
          user.username === username ? { ...user, status: "online" } : user
        )
      );
    }
    socket.on("friendOffline", friendOffline);
    socket.on("friendOnline", friendOnline);

    return () => {
      socket.off("friendOffline", friendOffline);
      socket.off("friendOffline", friendOnline);
    };
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Loader1 theme={theme === "light"} />
      </div>
    );
  }
  return (
    <SocketProvider>
      <div className={`xl:flex h-screen bg-card overflow-none`}>
        <div
          className={`xl:w-1/4 h-screen ${chat ? "hidden" : "block"} xl:block`}
        >
          <UserList userChatList={userChatList} />
        </div>

        {chat ? (
          <div className={`w-full xl:w-3/4 h-screen overflow-none`}>
            <UserChat />
          </div>
        ) : (
          <div
            className={`bg-card hidden xl:flex items-center justify-center w-full xl:w-3/4 h-screen text-zinc-500`}
          >
            <span className="w-1/2 flex justify-center flex-col items-center gap-5 ">
              <img src="./icon.png" className="w-15 h-15" alt="logo img" />
              Please select a chat to view messages
            </span>
          </div>
        )}
      </div>
    </SocketProvider>
  );
};

export default Home;
