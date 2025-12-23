import { createContext, useContext, useEffect, useState } from "react";
import socket from "@/utils/socketService";
import { useUser } from "./UserContext";
import { ChatContext } from "./ChatContext";
import { toast } from "sonner";
import { Message } from "@/types";

type SocketContextType = {
  socket: typeof socket;
  socketError: string | null;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const userCtx = useUser();
  const chatCtx = useContext(ChatContext);
  const [socketError,setSocketError] = useState<string | null>(null);
  if (!chatCtx) {
    throw new Error("SocketProvider must be inside ChatContextProvider");
  }

  const { chat, setChatArr } = chatCtx;
  const user = userCtx?.user;

  // ---- connect / disconnect ----
  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on("connect", () => {
      setSocketError(null)
      console.log("✅ socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      setSocketError(err.message);
      console.error("❌ socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [user]);

  // ---- direct messages ----
  useEffect(() => {
    const onDM = (message: Message) => {
      if (chat && "username" in chat && chat.username === message.fromUser) {
        setChatArr((prev) => [...prev, message]);
      } else {
        toast(`New message from ${message.fromUser}`);
      }
    };

    socket.on("sendMsg", onDM);
    return () => {
      socket.off("sendMsg", onDM);
    };
  }, [chat]);

  // ---- group messages ----
  useEffect(() => {
    const onGroupMsg = ({ groupId, message }: any) => {
      if (chat && "_id" in chat && chat._id === groupId) {
        setChatArr((prev) => [...prev, message]);
      } else {
        toast("New group message");
      }
    };

    socket.on("newGroupMessage", onGroupMsg);
    return () => {
      socket.off("newGroupMessage", onGroupMsg);
    };
  }, [chat]);

  // ---- presence ----
  useEffect(() => {
    socket.on("friendOnline", (username: string) => {
      toast(`${username} is online`);
    });

    socket.on("friendOffline", (username: string) => {
      toast(`${username} went offline`);
    });

    return () => {
      socket.off("friendOnline");
      socket.off("friendOffline");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket,socketError }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};
