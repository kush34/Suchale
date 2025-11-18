import { createContext, useContext, useEffect } from 'react';
import socket from '../utils/socketService';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { ChatContext } from './ChatContext';
import { Message, User, Group } from '@/types';

export const SocketContext = createContext<typeof socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const userCtx = useUser();
    const user = userCtx?.user;
    const chatCtx = useContext(ChatContext);

    if (!chatCtx) {
        console.error("ChatContext missing. Wrap SocketProvider inside ChatContextProvider.");
        return <>{children}</>; 
    }

    const { chat, groupFlag, setChatArr } = chatCtx;

    useEffect(() => {
        if (!user?.username) return;

        socket.emit('addUser', user.username);

        // ---- DM HANDLER ----
        const handleMsg = (message: Message) => {
            if (chat && "username" in chat && chat.username === message.fromUser) {
                setChatArr(prev => [...prev, message]);
            } else {
                toast(`New message from ${message.fromUser}`, {
                    duration: 5000,
                    position: 'top-right',
                });
            }
        };

        // ---- GROUP HANDLER ----
        const handleGroupMsg = (message: Message) => {
            if (chat && "name" in chat && chat._id === message.groupId) {
                setChatArr(prev => [...prev, message]);
            } else {
                toast(`New group message`, {
                    duration: 5000,
                    position: 'top-right',
                });
            }
        };

        socket.on("sendMsg", handleMsg);
        socket.on("sendMsgGrp", handleGroupMsg);

        return () => {
            socket.off("sendMsg", handleMsg);
            socket.off("sendMsgGrp", handleGroupMsg);
        };
    }, [user, chat, groupFlag]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
