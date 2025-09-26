import { Children, createContext, useEffect, useRef, useState } from "react";
import api from '../utils/axiosConfig.js'

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chatArr, setChatArr] = useState();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const chatDivRef = useRef();
    const sendMsg = async (content) => {
        if (!content || content.trim == "") return;
        try {
            const resposne = await api.post('/message/send', {
                toUser: chat?.username,
                content: content,
            })

            if (resposne.status == 200) {
                setChatArr((prev) => [...prev, { toUser: chat, content }])
            }
        } catch (error) {
            console.log(error);
        } finally {

        }
    }
    const getMessages = async (loadMore = false) => {
        if (loadMore && !hasMore) return; 
        setLoading(true);

        try {
            const nextPage = loadMore ? page + 1 : 1;
            const res = await api.post(
                `/message/getMessages?page=${nextPage}&limit=10`,
                { toUser: chat?.username }
            );

            if (loadMore) {
                setChatArr(prev => [...res.data.message, ...prev]);
                setPage(nextPage);
            } else {
                setChatArr(res.data.message);
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
    useEffect(() => {
        if(chat) getMessages(false);
    }, [chat])
    return (
        <ChatContext.Provider value={{ chat, setChat, sendMsg, chatArr, setChatArr, hasMore, chatDivRef,getMessages,loading,setLoading }}>
            {children}
        </ChatContext.Provider>
    )
}
