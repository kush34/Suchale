import { useContext, useEffect, useState } from "react";
import api from "@/utils/axiosConfig";
import UserChat from "@/components/UserChat";
import UserList from "@/components/UserList";
import Loader1 from "@/loaders/Loader1";
import { ChatContext } from "@/Store/ChatContext";
import { ThemeContext } from "@/Store/ThemeContext";
import { useSocket } from "@/Store/SocketContext";
import { Chat } from "@/types";
import CallComp from "@/components/call/call-comp";
import { trackEvent } from "@/lib/posthog";
import ChatAssetsDrawer from "@/components/user-chat/chat-assests";

const Home = () => {
  const [userChatList, setUserChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const { callUser, callType } = useSocket();
  const chatCtx = useContext(ChatContext);
  const themeCtx = useContext(ThemeContext);
  if (!chatCtx || !themeCtx) return null;

  const { chat,assetsOpen,setAssetsOpen } = chatCtx;
  const { theme } = themeCtx;
  
  useEffect(() => {
    trackEvent("messages_viewed");
  }, []);

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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`border-r xl:w-[360px] ${
          chat ? "hidden xl:block" : "block w-full"
        }`}
      >
        <UserList userChatList={userChatList} />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {callUser ? (
          <CallComp
            profilePic={callUser.profilePic}
            username={callUser.username}
          />
        ) : chat ? (
          <>
            <div className="flex-1">
              <UserChat/>
            </div>

            <ChatAssetsDrawer
              open={assetsOpen}
              onClose={() => setAssetsOpen(false)}
            />
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center xl:flex">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Welcome 👋</h2>

              <p className="mt-2 text-muted-foreground">
                Select a conversation to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
