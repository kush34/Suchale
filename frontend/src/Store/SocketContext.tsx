import {
  createContext,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import socket from "@/utils/socketService";
import { useUser } from "./UserContext";
import { ChatContext } from "./ChatContext";
import { toast } from "sonner";
import { Message, User } from "@/types";

type UserDispType = Pick<User, "username" | "profilePic">;

type RemoteStream = {
  kind: "audio" | "video";
  stream: MediaStream;
};

type CallType = "audio" | "video";

type SocketContextType = {
  socket: typeof socket;
  socketError: string | null;

  callUser: UserDispType | null;
  setCallUser: React.Dispatch<SetStateAction<UserDispType | null>>;
  callType: CallType | null;
  setCallType: React.Dispatch<SetStateAction<CallType | null>>
  audioElementRef: RefObject<HTMLAudioElement | null>;
  videoElementRef: RefObject<HTMLVideoElement | null>;

  endCall: () => void;

  callId: string | null;
  setCallId: React.Dispatch<SetStateAction<string | null>>;

  stream: RemoteStream[];
  setStream: React.Dispatch<SetStateAction<RemoteStream[]>>;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const userCtx = useUser();
  const chatCtx = useContext(ChatContext);
  if (!chatCtx) throw new Error("SocketProvider must be inside ChatContext");

  const { chat, setChatArr } = chatCtx;
  const user = userCtx?.user;

  const [socketError, setSocketError] = useState<string | null>(null);

  const [callUser, setCallUser] = useState<UserDispType | null>(null);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [callId, setCallId] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<RemoteStream[]>([]);

  const rtcRef = useRef<RTCPeerConnection | null>(null);

  const rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  /* ================= SOCKET CONNECT ================= */

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.on("connect", () => setSocketError(null));
    socket.on("connect_error", err => setSocketError(err.message));

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [user]);

  /* ================= MESSAGES ================= */

  useEffect(() => {
    const onDM = (msg: Message) => {
      if (chat && "username" in chat && chat.username === msg.fromUser) {
        setChatArr(p => [...p, msg]);
      } else toast(`New message from ${msg.fromUser}`);
    };

    socket.on("sendMsg", onDM);
    return () => { socket.off("sendMsg", onDM); }
  }, [chat]);

  useEffect(() => {
    const onGroup = ({ groupId, message }: any) => {
      if (chat && "_id" in chat && chat._id === groupId) {
        setChatArr(p => [...p, message]);
      } else toast("New group message");
    };

    socket.on("newGroupMessage", onGroup);
    return () => { socket.off("newGroupMessage", onGroup); }
  }, [chat]);

  /* ================= RTC HELPERS ================= */

  const createRTC = async (
    type: CallType,
    from: string,
    callId: string,
    isCaller: boolean,
    offer?: RTCSessionDescriptionInit
  ) => {
    setCallId(callId);
    setCallType(type);

    rtcRef.current = new RTCPeerConnection(rtcConfig);

    const constraints =
      type === "audio" ? { audio: true } : { audio: true, video: true };

    const local = await navigator.mediaDevices.getUserMedia(constraints);
    local.getTracks().forEach(t => rtcRef.current!.addTrack(t, local));

    if (type === "audio" && audioElementRef.current)
      audioElementRef.current.srcObject = local;

    if (type === "video" && videoElementRef.current)
      videoElementRef.current.srcObject = local;

    rtcRef.current.ontrack = e =>
      setStream(p => [...p, { kind: type, stream: e.streams[0] }]);

    rtcRef.current.onicecandidate = e =>
      e.candidate &&
      socket.emit("sendCandidate", { to: from, callId, candidate: e.candidate });

    if (offer) {
      await rtcRef.current.setRemoteDescription(offer);
      const answer = await rtcRef.current.createAnswer();
      await rtcRef.current.setLocalDescription(answer);
      socket.emit("sendAnswer", { to: from, callId, answer });
    }

    if (isCaller) {
      const newOffer = await rtcRef.current.createOffer();
      await rtcRef.current.setLocalDescription(newOffer);
      socket.emit("sendOffer", { to: from, callId, offer: newOffer });
    }
  };

  const endCall = () => {
    (audioElementRef.current?.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach(t => t.stop());

    (videoElementRef.current?.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach(t => t.stop());

    rtcRef.current?.close();
    rtcRef.current = null;

    if (callUser && callId)
      socket.emit("endCall", { callId, to: callUser.username });

    setStream([]);
    setCallUser(null);
    setCallType(null);
    setCallId(null);
  };

  /* ================= CALL EVENTS ================= */

  useEffect(() => {
    socket.on("incomingCall", ({ from, callId, type }) => {
      new Audio("/calling-sound.mp3").play();

      toast(`${from} is calling`, {
        action: {
          label: "Pick",
          onClick: () => {
            setCallUser({ username: from, profilePic: "" });
            setCallType(type);
            socket.emit("answerCall", { from, callId });
          },
        },
      });
    });

    socket.on("callAnswered", ({ from, callId }) => {
      createRTC(callType!, from, callId, true);
    });

    socket.on("receiveOffer", ({ from, callId, offer }) => {
      createRTC(callType!, from, callId, false, offer);
    });

    socket.on("receiveAnswer", ({ answer }) => {
      rtcRef.current?.setRemoteDescription(answer);
    });

    socket.on("receiveCandidate", ({ candidate }) => {
      rtcRef.current?.addIceCandidate(candidate);
    });

    socket.on("callEnded", endCall);

    return () => {
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("receiveOffer");
      socket.off("receiveAnswer");
      socket.off("receiveCandidate");
      socket.off("callEnded");
    };
  }, [callType]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketError,
        callUser,
        setCallUser,
        setCallType,
        callType,
        audioElementRef,
        videoElementRef,
        endCall,
        callId,
        setCallId,
        stream,
        setStream,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};
