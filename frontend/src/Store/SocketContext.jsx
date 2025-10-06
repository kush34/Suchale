import { createContext, useContext, useEffect } from 'react';
import socket from '../utils/socketService';
import { useUser } from './UserContext';
import { toast } from 'sonner';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useUser();

    useEffect(() => {
        if (user?.username) {
            socket.emit('addUser', user.username);
            
            socket.on("sendMsg", (message) => {
                console.log(message)
                toast(`New message from ${message.fromUser}`, {
                    duration: 5000,
                    position: 'top-right',
                });
            });

            socket.on("sendMsgGrp", (message) => {
                toast(`New group message from ${message.fromUser}`, {
                    duration: 5000,
                    position: 'top-right',
                });
            });
        }

        return () => {
            socket.off("sendMsg");
            socket.off("sendMsgGrp");
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};