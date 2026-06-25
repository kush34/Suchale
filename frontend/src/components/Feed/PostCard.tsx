import React, { useEffect, useState } from 'react'
import Profile from './Post/Profile'
import Footer from './Post/Footer';
import Media from './Post/Media';
import api from '@/utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { formatChatTime } from '../GroupCard';
import { trackEvent } from '@/lib/posthog';

interface PostCardProps {
    post: {
        _id: string;
        user: {
            profilePic: string;
            username: string;
        };
        media?: string[];
        content: string;
        createdAt: string;
        engagement: {
            likes: {
                user: string;
                likedAt: string;
                _id: string;
            }[];
            comments: {
                userId: string;
                content: string;
                createdAt: string;
            }[];
        };
        isLiked: boolean;
    };
    likeToggle: (id: string) => void;
    source?: "feed" | "profile";
}



const PostCard = ({ post, likeToggle, source = "feed" }: PostCardProps) => {
    const [liked, setLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.engagement.likes.length);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
    const date = formatChatTime(post.createdAt)
    const handleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const previousLiked = liked;
        const previousCount = likeCount;

        try {
            const newLikedState = !previousLiked;
            trackEvent(source === "feed" ? "post_liked_from_feed" : "profile_like_clicked", { post_id: post._id });

            setLiked(newLikedState);
            setLikeCount(prev =>
                newLikedState ? prev + 1 : prev > 0 ? prev - 1 : 0
            );

            const res = await api.post(`/post/like/${post._id}`);


            likeToggle(post._id);

        } catch (error) {
            console.error("Error toggling like:", error);

            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLoading(false);
        }
    };
    const renderContent = (text: string) => {
        const parts = text.split(/(@[a-zA-Z0-9_]+)/g);

        return parts.map((part, index) => {
            if (part.startsWith("@")) {
                return (
                    <span
                        key={index}
                        className="font-medium text-blue-500 hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();

                            const username = part.slice(1);

                            navigate(`/profile/${username}`);
                        }}
                    >
                        {part}
                    </span>
                );
            }

            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    return (
        <div className='p-5 rounded border-accent shadow border flex flex-col gap-2'>

            <span className='flex justify-between'>
                <Profile
                    src={post.user.profilePic || './836.jpg'}
                    username={post.user.username || 'text_34'}
                />
                <span className='font-light'>{date}</span>
            </span>
            <span
                onClick={() => {
                    trackEvent(
                        source === "feed"
                            ? "post_opened_from_feed"
                            : "profile_post_opened",
                        { post_id: post._id }
                    );

                    navigate(`/post/${post._id}`);
                }}
                className="text-xl cursor-pointer whitespace-pre-wrap break-words"
            >
                {renderContent(post.content)}
            </span>
            {post.media && <Media src={post.media} />}
            <Footer _id={post._id} like={likeCount} comments={post.engagement.comments.length} isLiked={liked} onLikeToggle={handleLike} isLoading={isLoading} source={source} />
        </div>
    )
}

export default PostCard
