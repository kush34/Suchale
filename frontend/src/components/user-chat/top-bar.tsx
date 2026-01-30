import { Undo2 } from "lucide-react"
import Profile from "@/components/Feed/Post/Profile"
import { Chat } from "@/types"
import { SetStateAction } from "react"
import { Phone } from "lucide-react";
import socket from "@/utils/socketService";
import { useSocket } from "@/Store/SocketContext";
type Props = {
    chat: Chat,
    isTyping: boolean
    setChat: React.Dispatch<SetStateAction<Chat | null>>
    setHoverTopbar: React.Dispatch<SetStateAction<boolean>>;
    ViewChatInfo: () => void;
}
export default function TopBar({ chat, ViewChatInfo, setHoverTopbar, setChat, isTyping }: Props) {
    const { audioCallUser,setAudioCallUser } = useSocket()
    const audioCall = (to_username: string) => {
        console.log(`audioCall fired`)
        if(!chat.username || !chat.profilePic){
            throw new Error("Chat username or chat profilepic does not exits");
        }
        setAudioCallUser({ username: chat.username, profilePic: chat.profilePic })
        console.log("Audio Call User",audioCallUser)
        socket.emit("initiateAudioCall", { to_username: to_username })
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
                <button onClick={() => audioCall(chat.username)}>
                    <Phone />
                </button>
            </div>
            <div className="xl:hidden back_btn">
                <button
                    className="text-sm cursor-pointer"
                    onClick={() => setChat(null)}
                >
                    <Undo2 />
                </button>
            </div>
        </span>
    )
}
