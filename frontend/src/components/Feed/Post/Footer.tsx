import { Heart, MessageCircle, Share } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PostFooterProps {
    like: number,
    comments: number;
    isLiked: boolean,
    onLikeToggle: () => void;
    isLoading?: boolean;
    _id: string;
}
const Footer = ({
    like,
    comments,
    isLiked,
    onLikeToggle,
    isLoading,
    _id
}: PostFooterProps) => {
    const navigate = useNavigate();
    const onCopy = () => {
        navigator.clipboard.writeText(`${import.meta.env.VITE_SITE_URL}/post/${_id}`)
        toast("Url copied")
    }
    return (
        <span className='flex justify-between mt-5 text-zinc-500'>
            <button
                onClick={() => onLikeToggle()}
                disabled={isLoading}
                className={`flex gap-2 items-center transition-colors ${isLiked
                    ? 'text-red-500'
                    : 'hover:text-red-400'
                    } disabled:opacity-50`}
            >
                <Heart fill={isLiked ? "currentColor" : "none"} />
                {like}
            </button>
            <button className='flex gap-2' onClick={()=>navigate(`/post/${_id}`)}>
                <MessageCircle />
                {comments}
            </button>
            <button onClick={onCopy} className='flex gap-2'>
                <Share />
            </button>
        </span>
    )
}

export default Footer