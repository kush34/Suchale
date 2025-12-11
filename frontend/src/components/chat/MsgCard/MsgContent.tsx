import ChatImageViewer from "@/components/ChatImageViewer";
import FileViewer from "@/components/FileViewer";
import VideoViewer from "@/components/VideoViewer";
import { Message } from "@/types";
import MsgMeta from "./MsgMeta";

type MsgContentProps = {
  msg: Message;
};

const MsgContent = ({ msg }: MsgContentProps) => {
  const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.content);
  const isVideo = /\.(mp4)$/i.test(msg.content);
  const isFile = /\.(pdf|docx|txt|rtf|odt)$/i.test(msg.content);

  return (
    <div className="msgContent text-xl">
      {isImage || isVideo ? (
        <div className="relative inline-block">
          {isImage && <ChatImageViewer src={msg.content} />}
          {isVideo && <VideoViewer src={msg.content} />}

          <div className="absolute bottom-2 right-2 z-20">
            <MsgMeta msg={msg} />
          </div>
        </div>
      ) : isFile ? (
        <>
          <FileViewer src={msg.content} filename={msg.content} />
          <MsgMeta msg={msg} />
        </>
      ) : (
        <>
          <div
            className={`flex justify-start text-lg ${
              msg.isDeleted && "opacity-60 italic text-red-300"
            }`}
          >
            {msg.content}
          </div>
          <MsgMeta msg={msg} />
        </>
      )}
    </div>
  );
};

export default MsgContent;
