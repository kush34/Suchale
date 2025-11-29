import { Heart, MessageCircle } from 'lucide-react'
import React from 'react'

interface PostFooterProps {
    like: number,
    comment: number,
}
const Footer = (engagement: PostFooterProps) => {
    return (
        <span className='flex justify-between mt-5'>
            <span className='flex gap-2'>
                <Heart />{engagement.like}
            </span>
            <span className='flex gap-2'>
                <MessageCircle />
                    {engagement.comment}
            </span>
        </span>
    )
}

export default Footer