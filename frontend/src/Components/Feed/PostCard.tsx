import React, { useEffect, useState } from 'react'
import Profile from './Post/Profile'
import Footer from './Post/Footer';
import Media from './Post/Media';
import api from '@/utils/axiosConfig';

interface PostCardProps {
    post: {
        _id: string;
        user: {
            profilePic: string;
            username: string;
        };
        media?: string[];
        content: string;
        engagement: {
            likes: {
                user: string;
                likedAt: string;
                _id: string;
            }[];
            comments: {
                userId: string;
                content: string;
                createdAt: Date;
            }[];
            isLiked: boolean;
        };
    };
    likeToggle: (id: string) => void;
}

const PostCard = ({ post, likeToggle }: PostCardProps) => {
    const [liked, setLiked] = useState(post.engagement.isLiked);
    const [likeCount, setLikeCount] = useState(post.engagement.likes.length);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const previousLiked = liked;
        const previousCount = likeCount;

        try {
            const newLikedState = !previousLiked;

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


    return (
        <div className='p-5 rounded border-zinc-200 shadow border flex flex-col gap-5'>
            <Profile
                src={post.user.profilePic || './836.jpg'}
                username={post.user.username || 'text_34'}
            />
            {post.media && <Media src={post.media} />}
            <span>{post.content}</span>
            <Footer like={likeCount} comments={post.engagement.comments.length} isLiked={liked} onLikeToggle={handleLike} isLoading={isLoading} />
        </div>
    )
}

export default PostCard

