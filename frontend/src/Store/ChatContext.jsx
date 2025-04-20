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
            toUser:chat?.username,
            content:content,
        })
        if(resposne.status == 200){
            setChatArr((prev)=>[...prev,{toUser:chat,content}])
        }
    }
    
    const getMessages = async ()=>{
        setLoading(true);
        const response = await api.post('/message/getMessages',{toUser:chat?.username});
        setChatArr(response.data);
        setLoading(false);
    }
    useEffect(()=>{
        getMessages();
    },[chat])
    return(
        <ChatContext.Provider value={{chat,setChat,sendMsg,chatArr,setChatArr}}>
            {children}
        </ChatContext.Provider>
    )
}
