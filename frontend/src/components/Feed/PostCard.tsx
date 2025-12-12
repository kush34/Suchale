import React, { useEffect, useState } from 'react'
import Profile from './Post/Profile'
import Footer from './Post/Footer';
import Media from './Post/Media';
import api from '@/utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { formatChatTime } from '../GroupCard';

interface PostCardProps {
    post: {
        _id: string;
        user: {
            profilePic: string;
            username: string;
        };
        media?: string[];
        content: string;
        createdAt:string;
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
            isLiked: boolean;
        };
    };
    likeToggle: (id: string) => void;
}

const PostCard = ({ post, likeToggle }: PostCardProps) => {
    const [liked, setLiked] = useState(post.engagement.isLiked);
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
        <div className='p-5 rounded border-accent shadow border flex flex-col gap-2'>

            <span className='flex justify-between'>
                <Profile
                    src={post.user.profilePic || './836.jpg'}
                    username={post.user.username || 'text_34'}
                />
                <span className='font-light'>{date}</span>
            </span>
            <span onClick={() => navigate(`/post/${post._id}`)} className='text-xl cursor-pointer'>{post.content}</span>
            {post.media && <Media src={post.media} />}
            <Footer _id={post._id} like={likeCount} comments={post.engagement.comments.length} isLiked={liked} onLikeToggle={handleLike} isLoading={isLoading} />
        </div>
    )
}

export default PostCard

