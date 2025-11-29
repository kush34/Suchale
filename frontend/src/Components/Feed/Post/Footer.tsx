import { Heart, MessageCircle, Share } from 'lucide-react'
import React from 'react'

interface PostFooterProps {
    like: number,
    comment: number,
}
const Footer = (engagement: PostFooterProps) => {
    return (
        <span className='flex justify-between mt-5 text-zinc-500'>
            <span className='flex gap-2'>
                <Heart />{engagement.like}
            </span>
            <span className='flex gap-2'>
                <MessageCircle />
                {engagement.comment}
            </span>
            <span className='flex gap-2'>
                <Share />
            </span>
        </span>
    )
}

export default Footer