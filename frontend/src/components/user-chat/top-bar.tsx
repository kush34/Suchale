import { Camera, Search, Undo2 } from "lucide-react"
import Profile from "@/components/Feed/Post/Profile"
import { Chat } from "@/types"
import { SetStateAction } from "react"
import { Phone } from "lucide-react";
import socket from "@/utils/socketService";
import { useSocket } from "@/Store/SocketContext";
import { useChat } from "@/Store/ChatContext";
type Props = {
    chat: Chat,
    isTyping: boolean
    setChat: React.Dispatch<SetStateAction<Chat | null>>
    setHoverTopbar: React.Dispatch<SetStateAction<boolean>>;
    ViewChatInfo: () => void;
}
export default function TopBar({ chat, ViewChatInfo, setHoverTopbar, setChat, isTyping }: Props) {
  const { setCallUser, callUser, setCallType } = useSocket()
  const { setAssetsOpen } = useChat();
    const initiateCall = (to_username: string, type: "audio" | "video") => {
        console.log(`call fired`)
        if (!chat.username || !chat.profilePic) {
            throw new Error("Chat username or chat profilepic does not exits");
        }
        setCallUser({ username: chat.username, profilePic: chat.profilePic })
        setCallType(type);
        console.log(`${type} Call User`, callUser)
        socket.emit("initiateCall", { to: to_username, type })
    }
    return (
        <span
            onClick={ViewChatInfo}
            onMouseEnter={() => setHoverTopbar(true)}
            onMouseLeave={() => setHoverTopbar(false)}
            className={`bg-secondary text-secondary-foreground profile-username-typingindicator-back_btn py-3 px-5 flex items-center justify-between gap-2 font-medium text-2xl`}
        >
            <Profile username={chat.username || chat.name} src={chat?.profilePic} />
            <div>
                {isTyping && <div className="text-green-500 text-sm">typing...</div>}
            </div>
            <div>
            </div>
        <div className="flex gap-5 back_btn">
                <button onClick={() => setAssetsOpen((prev)=>!prev)}>
                    <Search/>
                </button>
                <button onClick={() => initiateCall(chat.username, "video")}>
                    <Camera />
                </button>
                <button onClick={() => initiateCall(chat.username, "audio")}>
                    <Phone />
                </button>
                <button
                    className="xl:hidden text-sm cursor-pointer"
                    onClick={() => setChat(null)}
                >
                    <Undo2 />
                </button>
            </div>
        </span>
    )
}
