import React from 'react'

const MsgCard = ({msg}) => {
    const getDate = ()=>{
        const date = new Date("2025-04-09T08:55:28.270Z");
        const formatted = date.toISOString().split("T")[0];
        return formatted;
    }
  return (
    <div className='flex justify-between items-center'>
        <div className="msgContent text-xl">
            {msg.content}
        </div>
        <div className="text-sm text-zinc-500">
            {getDate(msg.createdAt)}
        </div>
    </div>
  )
}

export default MsgCard