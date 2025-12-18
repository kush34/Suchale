import { useContext, useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import UserChat from "@/components/UserChat";
import UserList from "@/components/UserList";
import Loader1 from "@/loaders/Loader1";
import { ChatContext } from "@/Store/ChatContext";
import { ThemeContext } from "@/Store/ThemeContext";
import { SocketProvider } from "@/Store/SocketContext";
import { Chat } from "@/types";

const Home = () => {
  const [userChatList, setUserChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  const chatCtx = useContext(ChatContext);
  const themeCtx = useContext(ThemeContext);
  if (!chatCtx || !themeCtx) return null;

  const { chat } = chatCtx;
  const { theme } = themeCtx;

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      const res = await api.get("/user/userList");
      setUserChatList(res.data.response);
      setLoading(false);
    };

    loadChats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader1 theme={theme === "light"} />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="xl:flex h-screen bg-card">
        <div className={`xl:w-1/4 ${chat ? "hidden" : "block"} xl:block`}>
          <UserList userChatList={userChatList} />
        </div>

        {chat ? (
          <div className="xl:w-3/4">
            <UserChat />
          </div>
        ) : (
          <div className="hidden xl:flex items-center justify-center w-3/4 text-zinc-500">
            Select a chat
          </div>
        )}
      </div>
    </SocketProvider>
  );
};

export default Home;
