import { Heart, MessageCircle, Share } from 'lucide-react'
import React from 'react'

interface PostFooterProps {
    like: number,
    comments: number;
    isLiked: boolean,
    onLikeToggle: () => void;
    isLoading?: boolean;
}
const Footer = (engagement: PostFooterProps) => {
    return (
        <span className='flex justify-between mt-5 text-zinc-500'>
            <button
                onClick={() => engagement.onLikeToggle()}
                disabled={engagement.isLoading}
                className={`flex gap-2 items-center transition-colors ${engagement.isLiked
                    ? 'text-red-500'
                    : 'hover:text-red-400'
                    } disabled:opacity-50`}
            >
                <Heart fill={engagement.isLiked ? "currentColor" : "none"} />
                {engagement.like}
            </button>
            <span className='flex gap-2'>
                <MessageCircle />
                {engagement.comments}
            </span>
            <span className='flex gap-2'>
                <Share />
            </span>
        </span>
    )
}

export default Footer