import { createContext, useContext, useEffect } from 'react';
import socket from '../utils/socketService';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { ChatContext } from './ChatContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useUser();
    const { chat, groupFlag, setChatArr } = useContext(ChatContext);

    useEffect(() => {
        if (!user?.username) return;

        socket.emit('addUser', user.username);

        const handleMsg = (message) => {
            console.log(message);
            console.log(chat?.username);

            if (chat?.username === message.fromUser) {
                setChatArr(prev => [...prev, message]);
            } else {
                toast(`New message from ${message.fromUser}`, { duration: 5000, position: 'top-right' });
            }
        };

        const handleGroupMsg = (message) => {
            if (chat?.name === message.fromUser && groupFlag) {
                setChatArr(prev => [...prev, message]);
            } else {
                toast(`New group message from ${message.name}`, { duration: 5000, position: 'top-right' });
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