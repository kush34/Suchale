import { Heart, MessageCircle, Share } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/posthog';

interface PostFooterProps {
    like: number,
    comments: number;
    isLiked: boolean,
    onLikeToggle: () => void;
    isLoading?: boolean;
    _id: string;
    source?: "feed" | "profile";
}
const Footer = ({
    like,
    comments,
    isLiked,
    onLikeToggle,
    isLoading,
    _id,
    source = "feed"
}: PostFooterProps) => {
    const navigate = useNavigate();
    const onCopy = () => {
        navigator.clipboard.writeText(`${import.meta.env.VITE_SITE_URL}/post/${_id}`)
        toast("Url copied")
        trackEvent("post_shared", { post_id: _id, method: "copy_link" });
    }
    return (
        <div className='flex items-center gap-8 text-zinc-500'>
            <button
                onClick={() => onLikeToggle()}
                disabled={isLoading}
                className={`flex items-center gap-1.5 text-sm transition-all ${isLiked
                    ? 'text-red-500'
                    : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                    } disabled:opacity-50`}
            >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                {like}
            </button>
            <button className='flex items-center gap-1.5 text-sm hover:text-zinc-900 dark:hover:text-zinc-100' onClick={() => {
                trackEvent(source === "feed" ? "comment_opened_from_feed" : "comment_opened", { post_id: _id });
                navigate(`/post/${_id}`)
            }}>
                <MessageCircle size={20} />
                {comments}
            </button>
            <button onClick={onCopy} className='flex items-center gap-1.5 text-sm hover:text-zinc-900 dark:hover:text-zinc-100'>
                <Share size={20} />
            </button>
        </div>
    )
}

export default Footer
