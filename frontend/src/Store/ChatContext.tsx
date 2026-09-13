import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from '../utils/axiosConfig';
import { UserContextType, useUser } from './UserContext';
import { Chat, Group, Message, User } from "@/types/index";
import { trackEvent } from "@/lib/posthog";
import type { IGif } from "@giphy/js-types";

type SendMessagePayload =
    | { content: string; isGroup: true; groupId: string }
    | { content: string; isGroup: false; toUser: string };

type ChatContextType = {
    chat: Chat | null;
    setChat: React.Dispatch<React.SetStateAction<Chat | null>>;

    chatArr: Message[];
    setChatArr: React.Dispatch<React.SetStateAction<Message[]>>;

    sendMsg: (content: string) => void;
    sendGif: (gif: IGif) => Promise<void>;
    chatDivRef: React.RefObject<HTMLDivElement | null>;

    groupFlag: boolean;
    setGroupFlag: React.Dispatch<React.SetStateAction<boolean>>;

getMessages: (loadMore?: boolean) => Promise<void>;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  hasMore: boolean;

  blockState: "none" | "blockedByMe" | "blockedByThem";
  unblockCurrent: () => Promise<void>;

  infoWindow: any[];
    setInfoWindow: React.Dispatch<React.SetStateAction<any[]>>;
  ViewChatInfo: () => void;

  assetsOpen: boolean;
  setAssetsOpen:React.Dispatch<React.SetStateAction<boolean>>
};

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
    const userCtx = useUser() as UserContextType | null;
    const user = userCtx?.user;

    const [chat, setChat] = useState<Chat | null>(null);
    const [groupFlag, setGroupFlag] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [chatArr, setChatArr] = useState<Message[]>([]);
    const [infoWindow, setInfoWindow] = useState<any[]>([]);
    const [blockState, setBlockState] = useState<"none" | "blockedByMe" | "blockedByThem">("none");
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [assetsOpen, setAssetsOpen] = useState(false);
    const chatDivRef = useRef<HTMLDivElement | null>(null);

    const appendOptimisticMessage = (message: Message) => {
        setChatArr(prev => [...(prev ?? []), message]);
    };

    const sendMsg = async (content: string) => {
        if (!content.trim()) return;
        if (!user || !chat) return;

        try {
            let payload: SendMessagePayload;

            if (groupFlag) {
                payload = {
                    content,
                    isGroup: true,
                    groupId: chat._id,
                };
            } else {
                // Only users have username
                if (!("username" in chat)) return;

                payload = {
                    content,
                    isGroup: false,
                    toUser: chat.username,
                };
            }

            const response = await api.post('/message/send', payload);

            if (response.status >= 200 && response.status < 300) {
                appendOptimisticMessage(response.data as Message);
                trackEvent("message_sent", {
                    chat_type: groupFlag ? "group" : "direct",
                    recipient: "username" in chat ? chat.username : chat.name,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const sendGif = async (gif: IGif) => {
        if (!user || !chat) return;

        const gifUrl =
            gif.images?.original?.url ||
            gif.images?.fixed_width?.url ||
            gif.images?.downsized?.url;

        if (!gifUrl) return;

        const gifMessage: Message = {
            _id: `${gif.id}-${Date.now()}`,
            fromUser: user.username,
            toUser: !groupFlag && "username" in chat ? chat.username : undefined,
            groupId: groupFlag ? chat._id : null,
            type: "gif",
            content: gifUrl,
            media: {
                provider: "giphy",
                providerMediaId: String(gif.id),
                mediaType: "gif",
                url: gifUrl,
                previewUrl: gif.images?.fixed_width_small_still?.url,
                width: Number(gif.images?.original?.width) || undefined,
                height: Number(gif.images?.original?.height) || undefined,
                mimeType: "image/gif",
            },
            isEdited: false,
            read: false,
            isDeleted: false,
            reactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
        };

        try {
            const payload = groupFlag
                ? {
                    toUser: undefined,
                    isGroup: true as const,
                    groupId: chat._id,
                    type: "gif" as const,
                    content: gifUrl,
                    media: gifMessage.media,
                }
                : {
                    toUser: "username" in chat ? chat.username : "",
                    isGroup: false as const,
                    type: "gif" as const,
                    content: gifUrl,
                    media: gifMessage.media,
                };

            const response = await api.post("/message/send", payload);

            if (response.status >= 200 && response.status < 300) {
                appendOptimisticMessage((response.data as Message) ?? gifMessage);
                trackEvent("gif_sent", {
                    chat_type: groupFlag ? "group" : "direct",
                    recipient: "username" in chat ? chat.username : chat.name,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMessages = async (loadMore = false) => {
        if (!chat) return;

        if (loadMore && !hasMore) return;
        if (loadMore) setLoading(true);

        try {
            const nextPage = loadMore ? page + 1 : 1;

            const res = await api.post(
                `/message/getMessages?page=${nextPage}&limit=10`,
                {
                    toUser: !groupFlag && "username" in chat ? chat.username : undefined,
                    groupId: groupFlag ? chat._id : undefined,
                    isGroup: groupFlag,
                }
            );

            if (loadMore) {
                setChatArr(prev => [...res.data.messages as Message[], ...(prev ?? [])]);
                setPage(nextPage);
            } else {
                setChatArr(res.data.messages);
                setPage(1);
            }

            setHasMore(res.data.hasMore);
        } catch (error: any) {
            console.log(error);

            if (
                !groupFlag &&
                chat &&
                "username" in chat &&
                error?.response?.status === 403 &&
                String(error?.response?.data?.error || "").startsWith("Forbidden")
            ) {
                try {
                    const prof = await api.get(`/user/profile/${chat.username}`);
                    setBlockState(prof.data?.data?.user?.isBlockedByMe ? "blockedByMe" : "blockedByThem");
                } catch {
                    // leave blockState untouched rather than guess
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const unblockCurrent = async () => {
        if (!chat || !("username" in chat)) return;

        try {
            const res = await api.post(`/user/unblockUser/${chat.username}`);
            if (res.status === 200) {
                setBlockState("none");
                setChatArr([]);
                await getMessages(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const ViewChatInfo = async () => {
        if (!groupFlag || !chat) return;

        try {
            const response = await api.post(`/message/getMembers/${chat._id}`);
            setInfoWindow(response.data);
            trackEvent("chat_info_viewed", { group_id: chat._id });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (chat) getMessages(false);
        setBlockState("none");
        setInfoWindow([]);
        setAssetsOpen(false);
    }, [chat]);

    return (
        <ChatContext.Provider
            value={{
                chat,
                setChat,
                chatArr,
                setChatArr,
                sendMsg,
                sendGif,
                chatDivRef,
                groupFlag,
                setGroupFlag,
                getMessages,
                loading,
                setLoading,
                hasMore,
                blockState,
                unblockCurrent,
                infoWindow,
                setInfoWindow,
                ViewChatInfo,
                assetsOpen,
                setAssetsOpen
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
};
