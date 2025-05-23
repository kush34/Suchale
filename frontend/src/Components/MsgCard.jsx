import React from 'react'
import ChatImageViewer from './ChatImageViewer';
import { Check } from 'lucide-react';
import { CheckCheck } from 'lucide-react';

const MsgCard = ({msg}) => {
    const getDate = ()=>{
        const date = new Date("2025-04-09T08:55:28.270Z");
        const formatted = date.toISOString().split("T")[0];
        return formatted;
    }
  return (
    <div className=' gap-2 items-center '>
        <div className="msgContent text-xl ">
        {msg.content?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
            // <img src={msg.content} alt="uploaded" className="max-w-xs rounded-lg" />
            <ChatImageViewer src={msg.content}/>
        ) : (
        <div className='flex justify-center text-lg'>
            {msg.content}
        </div>
        )}
        </div>
        <div className="flex text-[10px] justify-end gap-2">
            <div className=' text-zinc-500'>
                {getDate(msg.createdAt)}
            </div>
            <span className='text-white'>
                {msg.read ? <CheckCheck size={16}/>:<Check size={16} /> }
            </span>
        </div>
    </div>
  )
}

export default MsgCard