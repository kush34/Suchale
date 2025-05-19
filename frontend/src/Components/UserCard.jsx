import React, { useContext } from 'react'
import { ChatContext } from '../Store/ChatContext';
import { ThemeContext } from '../Store/ThemeContext';

const UserCard = ({user}) => {
    const {chat,setChat} = useContext(ChatContext);
    const {theme} = useContext(ThemeContext);
    const handleClick = (user)=>{
        if(chat?.username != user?.username) setChat(user);
      }
  return (
    <div onClick={()=>handleClick(user)} className={`${theme ? "bg-white text-black":" text-white"} flex gap-3 items-center pb-3 hover:bg-zinc-400 ease-in duration-150 rounded cursor-pointer`}>
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
                {user.username}
            </div>
            <div className="lastmsg font-light text-sm">
                call you later
            </div>
        </div>
    </div>
  )
}

export default UserCard