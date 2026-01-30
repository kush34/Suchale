import { Phone } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef } from "react";
import { useSocket } from "@/Store/SocketContext";

type Props = {
  username: string;
  profilePic: string;
};

const CallComp = ({ username, profilePic }: Props) => {
  const {
    callType,
    videoElementRef,
    audioElementRef,
    stream,
    endCall,
  } = useSocket();

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  /* attach remote streams */
  useEffect(() => {
    if (!stream.length) return;

    const remote = stream[0].stream;

    if (callType === "video") {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remote;
      }
    }

    if (callType === "audio") {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remote;
      }
    }
  }, [stream, callType]);

  return (
    <div className="w-full h-screen flex flex-col justify-between p-10">
      {/* Caller info */}
      <div className="flex flex-col items-center gap-6">
        <img
          src={profilePic}
          className="size-40 rounded-full"
          alt="caller"
        />
        <div className="text-2xl font-bold">{username}</div>
        <div className="text-sm opacity-70">
          {callType === "video" ? "Video Call" : "Audio Call"}
        </div>
      </div>

      {/* MEDIA */}
      {callType === "video" && (
        <div className="flex gap-6 justify-center">
          {/* LOCAL VIDEO (muted) */}
          <video
            ref={videoElementRef}
            autoPlay
            muted
            className="w-1/3 rounded-xl bg-black"
          />

          {/* REMOTE VIDEO */}
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-1/3 rounded-xl bg-black"
          />

          {/* REMOTE AUDIO ONLY */}
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      {callType === "audio" && (
        <>
          {/* REMOTE AUDIO ONLY */}
          <audio ref={remoteAudioRef} autoPlay />

          {/* local audio preview if needed */}
          <audio ref={audioElementRef} autoPlay muted />
        </>
      )}

      {/* ACTIONS */}
      <div className="flex justify-center">
        <Button onClick={endCall} variant="destructive" size="lg">
          <Phone />
        </Button>
      </div>
    </div>
  );
};

export default CallComp;
