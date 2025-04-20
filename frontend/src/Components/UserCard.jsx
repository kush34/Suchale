import React, { useContext } from 'react'
import { ChatContext } from '../Store/ChatContext';

const UserCard = ({user}) => {
    const {chat,setChat} = useContext(ChatContext);
    const handleClick = (username)=>{
        if(chat != username) setChat(username);
      }
  return (
    <div onClick={()=>handleClick(user.username)} className='flex items-center pb-3 hover:bg-zinc-200 ease-in duration-150 rounded cursor-pointer'>
        <div className="ml-2 userimg mt-2">
            <img className='w-12 h-12 rounded-full' src={user?.profilePic} alt="" />
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