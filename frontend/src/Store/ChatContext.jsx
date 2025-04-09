import { Children, createContext, useEffect, useState } from "react";
import api from '../utils/axiosConfig.js'

export const ChatContext = createContext();

export const ChatContextProvider = ({children})=>{
    const [chat,setChat] = useState(null);
    const [loading,setLoading] = useState(false);
    const [chatArr,setChatArr] = useState();
    const sendMsg =async (content)=>{
        if(!content) return;
        const resposne = await api.post('/message/send',{
            toUser:chat,
            content:content,
        })
    }
    const getMessages = async ()=>{
        setLoading(true);
        const response = await api.post('/message/getMessages',{toUser:chat});
        setChatArr(response.data);
        setLoading(false);
    }
    useEffect(()=>{
        getMessages();
    },[chat])
    return(
        <ChatContext.Provider value={{chat,setChat,sendMsg,chatArr}}>
            {children}
        </ChatContext.Provider>
    )
}
