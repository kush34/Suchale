import { useContext, useEffect, useState } from "react";
import { Search, ShieldBan, UserRoundPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "@/utils/axiosConfig";
import { Chat } from "@/types";
import { UserContext } from "@/Store/UserContext";
import { useSocket } from "@/Store/SocketContext";

import CreateGroupDialog from "./CreateGroupDialog";
import ChatCard from "./chat-card";

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
      <div className="flex h-full flex-col border-r bg-card">
        {/* Header */}
        <div className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Chats</h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/addContacts")}
                className="rounded-lg p-2 transition hover:bg-accent"
              >
                <UserRoundPlus size={20} />
              </button>

              <CreateGroupDialog />
            </div>
          </div>

          {socketError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500">
              <ShieldBan size={18} />
              Could not connect to server
            </div>
          )}
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="bg-accent flex items-center rounded-xl px-3">
            <Search
              size={18}
              className="text-muted-foreground"
            />

            <input
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
              placeholder="Search conversations"
              className="h-10 flex-1 bg-transparent px-3 outline-none"
            />

            {searchBar && (
              <button onClick={() => setSearchBar("")}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2">
          {dispChat.length ? (
            dispChat.map((chat) => (
              <ChatCard
                key={`${chat.isGroup ? "group" : "user"}-${chat._id}`}
                chatItem={chat}
              />
            ))
          ) : (
            <div className="mt-10 text-center text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </div>
    );
};

export default UserList;
