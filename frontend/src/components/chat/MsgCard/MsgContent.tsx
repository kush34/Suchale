import ChatImageViewer from "@/components/ChatImageViewer";
import FileViewer from "@/components/FileViewer";
import VideoViewer from "@/components/VideoViewer";
import { Message } from "@/types";

type MsgContentProps = {
    msg:Message;

}
const MsgContent = ({msg}:MsgContentProps) => {
  return (
    <div className="msgContent text-xl">
      {msg.content?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
        <ChatImageViewer src={msg.content} />
      ) : msg.content?.match(/\.(mp4)$/i) ? (
        <VideoViewer src={msg.content} />
      ) : msg.content?.match(/\.(pdf|docx|txt|rtf|odt)$/i) ? (
        <FileViewer src={msg.content} filename={msg.content} />
      ) : (
        <div
          className={`flex justify-start text-lg ${
            msg.isDeleted && "opacity-60 italic text-red-100"
          }`}
        >
          {msg.content}
        </div>
      )}
    </div>
  );
};

export default MsgContent;