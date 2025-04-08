import { Children, createContext, useEffect, useState } from "react";

export const ChatContext = createContext();

export const ChatContextProvider = ({children})=>{
    const [chat,setChat] = useState(null);
    const [chatArr,setChatArr] = useState();
    useEffect(()=>{
        console.log(chat);
    },[chat])
    return(
        <ChatContext.Provider value={{chat,setChat}}>
            {children}
        </ChatContext.Provider>
    )
}
