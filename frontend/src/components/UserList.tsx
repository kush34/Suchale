import { useContext, useEffect, useState } from "react";
import { Search, ShieldBan, UserRoundPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "@/utils/axiosConfig";
import { Chat } from "@/types";
import { UserContext } from "@/Store/UserContext";
import { useSocket } from "@/Store/SocketContext";

import CreateGroupDialog from "./CreateGroupDialog";
import ChatCard from "./UserCard";

const UserList = ({ userChatList }: { userChatList: Chat[] }) => {
  const [dispChat, setDispChat] = useState<Chat[]>(userChatList);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchBar, setSearchBar] = useState("");

  const userCtx = useContext(UserContext);
  const socketCtx = useSocket();

  if (!userCtx || !socketCtx) return null;

  const navigate = useNavigate();
  const socketError = socketCtx.socketError;

  const searchMsgs = async (query: string) => {
    try {
      const response = await api.get(`/message/search?term=${query}`);

      if (response.status === 200) {
        return response.data.data;
      }
    } catch {
      toast("No results found");
    }

    return [];
  };

  useEffect(() => {
    const q = searchBar.trim().toLowerCase();

    if (!q) {
      setDispChat(userChatList);
      return;
    }

    const run = async () => {
      const local = userChatList.filter((item) => {
        return (
          item.username?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q)
        );
      });

      const apiResults = await searchMsgs(q);

      const merged = [...local, ...apiResults];

      const unique = merged.filter(
        (item, index, arr) =>
          index ===
          arr.findIndex(
            (x) =>
              x._id === item._id &&
              x.isGroup === item.isGroup
          )
      );

      setDispChat(unique);
    };

    run();
  }, [searchBar, userChatList]);

  return (
    <div className="bg-card h-full border-r-2 p-4 md:p-0">
      <div className="flex justify-end">
        {socketError && (
          <span className="m-5 flex items-center gap-2 rounded bg-red-200 p-2 text-sm text-red-500">
            <ShieldBan />
            Could not connect to server
          </span>
        )}

        <div className="m-3 flex items-center">
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="m-1 cursor-pointer transition hover:scale-110"
          >
            <Search />
          </button>

          <button
            onClick={() => navigate("/addContacts")}
            className="m-1 cursor-pointer transition hover:scale-110"
          >
            <UserRoundPlus />
          </button>

          <CreateGroupDialog />
        </div>
      </div>

      <div className="px-4">
        {isSearchOpen && (
          <div className="bg-accent flex items-center rounded">
            <input
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
              placeholder="Search"
              className="w-full rounded py-1 text-center outline-none"
            />

            {searchBar && (
              <button
                onClick={() => setSearchBar("")}
                className="px-2"
              >
                <X />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="m-3 h-5/6">
        {dispChat.length > 0 ? (
          <div className="h-full overflow-y-auto no-scrollbar">
            {dispChat.map((chat) => (
              <ChatCard
                key={`${chat.isGroup ? "group" : "user"}-${chat._id}`}
                chatItem={chat}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">No Chats Found</div>
        )}
      </div>
    </div>
  );
};

export default UserList;