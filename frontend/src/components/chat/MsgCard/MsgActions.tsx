import { Message } from "@/types";
import { Pen, Trash } from "lucide-react";

type MsgActionsProps = {
  msg: Message;
  handleCloseMenu: () => void;
  handleEditClick: () => void;
  onDelete: (id: string) => void;
};
const MsgActions = ({
  msg,
  handleCloseMenu,
  handleEditClick,
  onDelete,
}: MsgActionsProps) => {
  return (
    <div
      onMouseLeave={handleCloseMenu}
      className="flex absolute right-0 top-0 bg-secondary  text-sm rounded-md shadow-md p-2 z-50"
    >
      <div
        onClick={handleEditClick}
        className="px-3 py-1 rounded cursor-pointer"
      >
        <Pen />
      </div>
      <div
        onClick={() => {
          onDelete(msg._id);
          handleCloseMenu();
        }}
        className="text-red-600 hover:text-red-500 px-3 py-1 rounded cursor-pointer"
      >
        <Trash />
      </div>
    </div>
  );
};

export default MsgActions;
