import React from 'react'

const MsgCard = ({msg}) => {
    const getDate = ()=>{
        const date = new Date("2025-04-09T08:55:28.270Z");
        const formatted = date.toISOString().split("T")[0];
        return formatted;
    }
  return (
    <div className=''>
        <div className="msgContent text-xl">
        {msg.content?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
            <img src={msg.content} alt="uploaded" className="max-w-xs rounded-lg" />
        ) : (
        <div className='flex justify-center'>
            {msg.content}
        </div>
        )}
        </div>
        <div className="text-[10px] text-zinc-500 ml-5 flex justify-end">
            {getDate(msg.createdAt)}
        </div>
    </div>
  )
}

export default MsgCard