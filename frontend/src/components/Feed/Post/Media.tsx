import ChatImageViewer from '@/components/ChatImageViewer';
import FileViewer from '@/components/FileViewer';
import VideoViewer from '@/components/VideoViewer';
import React from 'react'

interface MediaProps {
    src: string[];
}


const Media = ({ src }: MediaProps) => {
    return (
        <div className='grid grid-cols-2'>
            {src.map(
                (item, index) =>
                    item?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <ChatImageViewer src={item} />
                    ) : item?.match(/\.(mp4)$/i) ? (
                        <VideoViewer src={item} />
                    ) : (
                        <FileViewer src={item} filename={item} />
                    )
            )
            }
        </div>
    )
}

export default Media