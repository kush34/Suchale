import { Message, User } from "@/types"
import MsgCard from "@/components/chat/MsgCard/MsgCard"
import { Ref } from "react"


type Props = {
  chatDivRef: Ref<HTMLDivElement>
  chatArr: Message[]
  messagesEndRef: Ref<HTMLDivElement>
  loading: boolean
  user: User
}

export default function ChatDisplay({ chatDivRef, chatArr, messagesEndRef, loading, user }: Props) {
  const isMediaMessage = (msg: Message) => {
    const mediaUrl = msg.media?.url || msg.content;
    return msg.type === "gif" ||
      msg.type === "image" ||
      msg.type === "video" ||
      /\.(jpeg|jpg|gif|png|webp|mp4)$/i.test(mediaUrl);
  };

  return (
    <div
      ref={chatDivRef}
      className="
    flex flex-col w-full overflow-y-auto no-scrollbar
    pb-[calc(var(--nav-h)+var(--input-h))]
    h-[100dvh]
  "
    >
      {chatArr && chatArr.length > 0 && (
        <>
          {chatArr.map((msg: Message) => (
            <div
              key={msg?._id}
              className={`w-full flex ${msg.fromUser === user.username
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <span
                className={`w-fit max-w-[75%] m-2 rounded ${isMediaMessage(msg)
                  ? ""
                  : `${msg.fromUser === user.username
                    ? "bg-muted"
                    : "bg-accent"
                  } px-3 py-2`
                  }`}
              >
                <MsgCard msg={msg} currentUser={user.username} />
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <span className="mb-5" />
        </>
      )}
      {!loading && chatArr?.length == 0 && (
        <div className="flex justify-center items-center mt-10 text-zinc-500">
          No messages found
        </div>
      )}
    </div>
  )
}
