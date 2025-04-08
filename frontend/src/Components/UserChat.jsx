import React, { useContext, useState } from 'react'
import { ImagePlay } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import { ChatContext } from '../Store/ChatContext';
const UserChat = () => {
  const {chat} = useContext(ChatContext);
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
        <div className='flex justify-evenly m-3 '>
          <div className='cursor-pointer text-zinc-900 w-1/4  flex items-center justify-center hover:text-black ease-in duration-100 hover:scale-110'><ImagePlay /></div>
          <div className=' w-3/4'>
            <input type="text" className='focus:bg-zinc-300 w-full bg-zinc-200 outline-none rounded px-3 py-2' placeholder='type your message here' name="" id="" />
          </div>
          <div className=' cursor-pointer text-zinc-900 flex  items-center justify-center w-1/4 hover:text-black ease-in duration-100 hover:scale-110'><SendHorizontal /></div>
        </div>
    </div>
  )
}

export default UserChat