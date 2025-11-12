import React from 'react'
import ChatImageViewer from './ChatImageViewer';
import { Check } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import VideoViewer from './VideoViewer';
import FileViewer from './FileViewer';

const MsgCard = ({ msg }) => {
    const getDate = () => {
        const date = new Date("2025-04-09T08:55:28.270Z");
        const formatted = date.toISOString().split("T")[0];
        return formatted;
    }
    return (
        <div className=' gap-2 items-center '>
            <div className="msgContent text-xl ">
                {
                    msg.content?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <ChatImageViewer src={msg.content} />
                    ) : msg.content?.match(/\.(mp4)$/i) ? (
                        <VideoViewer src={msg.content} />
                    ) : msg.content?.match(/\.(pdf|docx|txt|rtf|odt)$/i) ? (
                        <FileViewer src={msg.content} />
                    ) : (
                        <div className={`flex justify-start text-lg ${msg.isDeleted && "opacity-60 italic text-red-100"}`}>{msg.content}</div>
                    )
                }

            </div>
            <div className="flex text-[10px] justify-end gap-2">
                <div className=' text-zinc-500'>
                    {msg.isEdited && <span className='mx-3'>Edited</span>}
                    {getDate(msg.createdAt)}
                </div>
                <span className='text-white'>
                    {msg.read ? <CheckCheck size={16} /> : <Check size={16} />}
                </span>
            </div>
        </div>
    )
}

export default MsgCard