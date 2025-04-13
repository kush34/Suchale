import React, { useContext, useState } from 'react'
import { ImagePlay } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import { ChatContext } from '../Store/ChatContext';
import MsgCard from './MsgCard';
import { useUser } from '../Store/UserContext';
import { useSocket } from '../Store/SocketContext';
const UserChat = () => {
  // const {chat,sendMsg,chatArr} = useContext(ChatContext);
  const {chat,chatArr} = useContext(ChatContext);
  const [message,setmessage] = useState();
  const {user} = useUser();
  const socket = useSocket();

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      // from: user._id,
      toUser: chat,
      message: message,
    };

    // Emit the message to server
    socket.emit("send-message", msgData);

    // Optionally, update UI immediately
    // updateMessages(msgData);

    setMessage("");
  };
  if(!chat){
    return(
      <div className='flex justify-center items-center w-3/4 text-zinc-500'>
        Please select chat to view messages
      </div>
    )
  }
  return (
    <div className='bg-white flex flex-col justify-between rounded-t-2xl w-3/4 m-5 h-9.5/10'>
        <div className='top py-3 px-5 flex items-center justify-between rounded-t-2xl font-medium text-2xl bg-black text-white'>
            <div className="img">
                <img className='rounded-full w-15 h-15' src="https://placehold.co/400x400" alt="" />
            </div>
            <div className=" ">
                {chat}
            </div>
        </div>
        <div className='flex flex-col h-full w-full'>
        {chatArr ? 
          chatArr.map((msg)=>{
            return(
            <span className={`${chat!=msg.toUser ? "bg-zinc-700": "bg-black"}  w-1/2 text-white rounded m-2 px-2 py-1`}>
              <MsgCard msg={msg}/>
            </span>
            )
          })
        
        :
        <div>
          No messages found
        </div>
        }
        </div>
        <div className='flex justify-evenly m-3 '>
          <div className='cursor-pointer text-zinc-900 w-1/4  flex items-center justify-center hover:text-black ease-in duration-100 hover:scale-110'><ImagePlay /></div>
          <div className=' w-3/4'>
            <input onChange={(e)=>setmessage(e.target.value)} type="text" className='focus:bg-zinc-300 w-full bg-zinc-200 outline-none rounded px-3 py-2' placeholder='type your message here' name="" id="" />
          </div>
          <div onClick={sendMessage} className=' cursor-pointer text-zinc-900 flex  items-center justify-center w-1/4 hover:text-black ease-in duration-100 hover:scale-110'><SendHorizontal /></div>
        </div>
    </div>
  )
}

export default UserChat