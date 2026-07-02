import ChatImageViewer from "@/components/ChatImageViewer";
import FileViewer from "@/components/FileViewer";
import VideoViewer from "@/components/VideoViewer";
import { Message } from "@/types";
import MsgMeta from "./MsgMeta";

type MsgContentProps = {
  msg: Message;
};

const MsgContent = ({ msg }: MsgContentProps) => {
  const mediaUrl = msg.media?.url || msg.content;
  const isGif = msg.type === "gif" || msg.media?.mediaType === "gif";
  const isImage =
    isGif || /\.(jpeg|jpg|gif|png|webp)$/i.test(mediaUrl);
  const isVideo = msg.type === "video" || /\.(mp4)$/i.test(mediaUrl);
  const isFile = msg.type === "file" || /\.(pdf|docx|txt|rtf|odt)$/i.test(mediaUrl);

  return (
    <div className="msgContent text-xl">
      {isImage || isVideo ? (
        <div className="relative inline-block">
          {isImage && <ChatImageViewer src={mediaUrl} />}
          {isVideo && <VideoViewer src={mediaUrl} />}

          <div className="absolute bottom-2 right-2 z-20">
            <MsgMeta msg={msg} />
          </div>
        </div>
      ) : isFile ? (
        <>
          <FileViewer src={mediaUrl} filename={mediaUrl} />
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
