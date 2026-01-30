import { createContext, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import socket from "@/utils/socketService";
import { useUser } from "./UserContext";
import { ChatContext } from "./ChatContext";
import { toast } from "sonner";
import { Message, User } from "@/types";

type UserDispType = Pick<User, "username" | "profilePic">

type RemoteStream = {
  kind: "audio" | "video";
  stream: MediaStream;
};

type SocketContextType = {
  socket: typeof socket;
  socketError: string | null;
  audioCallUser: UserDispType | null;
  setAudioCallUser: React.Dispatch<SetStateAction<UserDispType | null>>
  audioElementRef: RefObject<HTMLAudioElement | null>,
  stream: RemoteStream[]
  setStream: React.Dispatch<SetStateAction<RemoteStream[]>>
  endAudioCall: () => void
  callId: string | null,
  setCallId: React.Dispatch<SetStateAction<string | null>>
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const userCtx = useUser();
  const chatCtx = useContext(ChatContext);
  const [audioCallUser, setAudioCallUser] = useState<UserDispType | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [stream, setStream] = useState<RemoteStream[]>([]);
  const audioRTCconnection = useRef<RTCPeerConnection | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
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
  // ---- AudioCall ----
  type createRTCconnnection = {
    fromUser: string
    callId: string
  }
  const createRTCAudioconnnection = async ({ fromUser, callId }: createRTCconnnection) => {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    setCallId(callId);
    audioRTCconnection.current = new RTCPeerConnection(configuration);

    // 🎤 Local audio
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(track => {
      audioRTCconnection.current!.addTrack(track, localStream);
    });

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = localStream;
    }

    // 🔊 Remote audio
    audioRTCconnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;

      setStream(prev => [
        ...prev,
        { kind: "audio", stream: remoteStream },
      ]);
    };

    // ❄ ICE candidates
    audioRTCconnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("sendCandidate", {
          callId,
          to: fromUser,
          candidate: event.candidate,
        });
      }
    };

    // 📜 CREATE OFFER
    const offer = await audioRTCconnection.current.createOffer();
    await audioRTCconnection.current.setLocalDescription(offer);

    socket.emit("sendOffer", {
      to: fromUser,
      callId,
      offer,
    });
  };
  const handleReceiveOffer = async ({ from, callId, offer }: any) => {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    audioRTCconnection.current = new RTCPeerConnection(configuration);

    // 🎤 Local audio
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(track => {
      audioRTCconnection.current!.addTrack(track, localStream);
    });

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = localStream;
    }

    // 🔊 Remote audio
    audioRTCconnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteStream) return;

      setStream(prev => [
        ...prev,
        { kind: "audio", stream: remoteStream },
      ]);
    };

    // ❄ ICE candidates
    audioRTCconnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("sendCandidate", {
          callId,
          candidate: event.candidate,
        });
      }
    };

    // 📥 APPLY OFFER
    await audioRTCconnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    // 📜 CREATE ANSWER
    const answer = await audioRTCconnection.current.createAnswer();
    await audioRTCconnection.current.setLocalDescription(answer);

    socket.emit("sendAnswer", {
      to: from,
      callId,
      answer,
    });
  };
  const endAudioCall = () => {
    if (audioElementRef.current?.srcObject instanceof MediaStream) {
      audioElementRef.current.srcObject
        .getTracks()
        .forEach(track => track.stop());
      audioElementRef.current.srcObject = null;
    }

    audioRTCconnection.current?.close();
    audioRTCconnection.current = null;

    
    if(audioCallUser && audioCallUser.username && audioCallUser.profilePic){
      socket.emit("endAudioCall", { callId, to:audioCallUser.username });
      // 3. Reset state
      setStream([]);
      setAudioCallUser(null);
    }
  };

  useEffect(() => {
    socket.on("incomingAudioCall", ({ from, callId }) => {
      const audio = new Audio("/calling-sound.mp3")
      audio.play();

      toast(`${from} is calling.`, {
        description: " You have an incoming Audio Call",
        action: {
          label: "Pick",
          onClick: () => {
            setCallId(callId)
            setAudioCallUser({ username: from, profilePic: "" })
            socket.emit("answerIncomingAudioCall", { from, callId });
          }
        }
      });
    });

    socket.on("callAnswered", createRTCAudioconnnection)
    socket.on("receiveOffer", handleReceiveOffer);
    socket.on("receiveAnswer", async ({ answer }) => {
      if (!audioRTCconnection.current) return;

      await audioRTCconnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
    socket.on("receiveCandidate", async ({ candidate }) => {
      if (!audioRTCconnection.current) return;
      await audioRTCconnection.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });
    socket.on('receiveCandidate', candidate => {
      if (!audioRTCconnection.current) return new Error("audioRTCconnection coudl not be found.");
      audioRTCconnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on("audioCallEnded", () => {
      // Same cleanup logic
      if (audioElementRef.current?.srcObject instanceof MediaStream) {
        audioElementRef.current.srcObject.getTracks().forEach(t => t.stop());
        audioElementRef.current.srcObject = null;
      }

      audioRTCconnection.current?.close();
      audioRTCconnection.current = null;

      setStream([]);
      setAudioCallUser(null);
    });

    return () => {
      socket.off("incomingAudioCall");
      socket.off("callAnswered");
      socket.off("receiveCandidate");
      socket.off("audioCallEnded");
    };
  }, []);
  return (
    <SocketContext.Provider value={{ socket, socketError, audioCallUser, callId, setCallId, endAudioCall, audioElementRef, setAudioCallUser, stream, setStream }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};
