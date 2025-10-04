import React, { useContext } from 'react'
import { ChatContext } from '../Store/ChatContext';
import { ThemeContext } from '../Store/ThemeContext';

const GroupCard = ({group}) => {
    const {chat,setChat,setGroupFlag} = useContext(ChatContext);
    const {theme} = useContext(ThemeContext);
    const handleClick = (group)=>{
        if(chat?.username != group?.name){
            setChat(group);
            setGroupFlag(true);
        }
    }
    // console.log(group)
  return (
    <div onClick={()=>handleClick(group)} className={`${theme ? "bg-white text-black":" text-white"} flex gap-3 items-center pb-3  hover:scale-101 hover:bg-zinc-600 ease-in  duration-150 rounded cursor-pointer hover:shadow-xl`}>
        <div className="ml-2 userimg mt-2 flex items-end">
            <div>
                <img className='w-12 h-12 rounded-full' src={group?.profilePic} alt="" />
            </div>
            {/* {
                user.status == "Online" &&
                <div className='bg-green-500 w-2 h-2 rounded-full'>
                </div>
            } */}
        </div>
        <div className='mx-2'>
            <div className="userName text-xl font-medium">
                {group?.name}
            </div>
            <div className="lastmsg font-light text-sm">
                call you later
            </div>
        </div>
    </div>
  )
}

export default GroupCard