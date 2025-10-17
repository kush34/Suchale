import { Children, createContext, useEffect, useRef, useState } from "react";
import api from '../utils/axiosConfig.js';
import { useUser } from './UserContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    const { user } = useUser();
    const [chat, setChat] = useState(null);
    const [groupFlag, setGroupFlag] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatArr, setChatArr] = useState([]);
    const [infoWindow, setInfoWindow] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const chatDivRef = useRef();
    const sendMsg = async (content) => {
        if (!content || content.trim() === "") return;

        try {
            console.log(`send MSG : ${groupFlag}`)
            const payload = {
                content,
                isGroup: groupFlag,
            };

            if (groupFlag) payload.groupId = chat._id;
            else payload.toUser = chat?.username;

            const response = await api.post('/message/send', payload);

            if (response.status === 200) {
                const newMessage = {
                    fromUser: user.username,
                    toUser: chat.username,
                    content,
                    groupId: groupFlag ? chat._id : undefined,
                    createdAt: new Date().toISOString()
                };
                setChatArr((prev) => [...(prev || []), newMessage]);
            }
        } catch (error) {
            console.log(error);
            res.send({error:"Something went wrong on the server while sending msg"})
        }
    };

    const getMessages = async (loadMore = false) => {
        if (loadMore && !hasMore) return;
        if(loadMore) setLoading(true);

        try {
            const nextPage = loadMore ? page + 1 : 1;
            const res = await api.post(
                `/message/getMessages?page=${nextPage}&limit=10`,
                { toUser: chat?.username, groupId: chat._id, isGroup: groupFlag }
            );

            if (loadMore) {
                setChatArr(prev => [...res.data.messages, ...prev]);
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
    const handleScroll = () => {
        if (!chatDivRef.current) return;
        if (chatDivRef.current.scrollTop === 0) {
            getMessages(true);
        }
    };
    const ViewChatInfo = async () => {
        if (!groupFlag) return;
        try {
            const response = await api.post(`/message/getMembers/${chat._id}`);
            setInfoWindow(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        if (chat) getMessages(false);
        setInfoWindow([])
        console.log("chat",chat)
    }, [chat])
    return (
        <ChatContext.Provider value={{ chat, setChat, chatArr, setChatArr, hasMore, chatDivRef, getMessages, loading, setLoading, setGroupFlag, groupFlag, infoWindow, setInfoWindow, ViewChatInfo,sendMsg }}>
            {children}
        </ChatContext.Provider>
    )
}
