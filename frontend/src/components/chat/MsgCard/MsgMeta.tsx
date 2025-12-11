import { formatChatTime } from "@/components/GroupCard";
import { Message } from "@/types";
import { Check, CheckCheck } from "lucide-react";

type MsgMetapProps = {
    msg:Message;
}
const MsgMeta = ({msg}:MsgMetapProps) => {
  return (
    <div className="flex text-[10px] justify-end gap-2">
      <div className="text-zinc-500">
        {msg.isEdited && <span className="mx-3">Edited</span>}
        {formatChatTime(msg.createdAt)}
      </div>
      <span className="text-white">
        {msg.read ? <CheckCheck size={16} /> : <Check size={16} />}
      </span>
    </div>
  );
};

export default MsgMeta;