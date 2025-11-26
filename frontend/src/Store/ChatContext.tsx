import { createContext, useEffect, useRef, useState } from "react";
import api from '../utils/axiosConfig';
import { UserContextType, useUser } from './UserContext';
import { Chat, Group, Message, User } from "@/types/index";

type SendMessagePayload =
    | { content: string; isGroup: true; groupId: string }
    | { content: string; isGroup: false; toUser: string };

type ChatContextType = {
    chat: Chat | null;
    setChat: React.Dispatch<React.SetStateAction<Chat | null>>;

    chatArr: Message[];
    setChatArr: React.Dispatch<React.SetStateAction<Message[]>>;

    sendMsg: (content: string) => void;
    chatDivRef: React.RefObject<HTMLDivElement | null>;

    groupFlag: boolean;
    setGroupFlag: React.Dispatch<React.SetStateAction<boolean>>;

    getMessages: (loadMore?: boolean) => Promise<void>;

    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;

    hasMore: boolean;

    infoWindow: any[];
    setInfoWindow: React.Dispatch<React.SetStateAction<any[]>>;
    ViewChatInfo: () => void;
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
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const chatDivRef = useRef<HTMLDivElement | null>(null);

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

            if (response.status === 200) {
                const newMessage: Message = {
                    _id: response.data._id,
                    fromUser: user.username,
                    toUser: "username" in chat ? chat.username : "",
                    content,
                    groupId: groupFlag ? chat._id : null,
                    isEdited: false,
                    read: false,
                    isDeleted: false,
                    reactions: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    __v: 0,
                };

                setChatArr(prev => [...(prev ?? []), newMessage]);
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
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const ViewChatInfo = async () => {
        if (!groupFlag || !chat) return;

        try {
            const response = await api.post(`/message/getMembers/${chat._id}`);
            setInfoWindow(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (chat) getMessages(false);
        setInfoWindow([]);
    }, [chat]);

    return (
        <ChatContext.Provider
            value={{
                chat,
                setChat,
                chatArr,
                setChatArr,
                sendMsg,
                chatDivRef,
                groupFlag,
                setGroupFlag,
                getMessages,
                loading,
                setLoading,
                hasMore,
                infoWindow,
                setInfoWindow,
                ViewChatInfo,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
