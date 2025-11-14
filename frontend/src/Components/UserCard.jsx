import React, { useContext } from 'react'
import { ChatContext } from '../Store/ChatContext';
import { ThemeContext } from '../Store/ThemeContext';
import { Infinity } from 'lucide-react';
import { formatChatTime } from './GroupCard';

const UserCard = ({ user }) => {
    const { chat, setChat, setGroupFlag } = useContext(ChatContext);
    const { theme } = useContext(ThemeContext);
    const dateString = user?.lastMessage?.createdAt;
    const formattedTime = formatChatTime(dateString);
    const handleClick = (user) => {
        if (chat?.username != user?.username) {
            setChat(user);
            setGroupFlag(false);
            console.log(`setting User:${user}`)
        }
    }
    return (
        <div onClick={() => handleClick(user)} className={`${theme ? "bg-white border-zinc-100 text-black" : " text-white border-zinc-800"} border-b flex gap-3 justify-between items-center pb-3 hover:bg-zinc-400 ease-in  duration-150 border-0  cursor-pointer hover:shadow-xl`}>
            <div className='flex gap-3 items-center'>
                <div className="ml-2 userimg mt-2 flex items-end">
                    <div>
                        <img className='w-12 h-12 rounded-full' src={user?.profilePic} alt="" />
                    </div>
                    {
                        user.status == "Online" &&
                        <div className='bg-green-500 w-2 h-2 rounded-full'>
                        </div>
                    }
                </div>
                <div className='mx-2'>
                    <div className="userName text-xl font-medium">
                        {user?.username}
                    </div>
                    <div className="lastmsg font-light text-sm text-zinc-500">
                        {user?.lastMessage?.content.slice(0, 10) || "no msgs"}
                    </div>
                </div>
            </div>
            <div className='flex items-start text-sm text-zinc-500'>
                {user?.lastMessage?.createdAt ?
                    <span >
                        {formattedTime}
                    </span>
                    :
                    <span>
                        <Infinity size={16} strokeWidth={1} />
                    </span>
                }
            </div>
        </div>
    )
}

export default UserCard