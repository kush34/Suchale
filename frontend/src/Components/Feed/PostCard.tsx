import React from 'react'
import Profile from './Post/Profile'
import Footer from './Post/Footer';
import Media from './Post/Media';



interface PostCardProps {
    post: {
        post_id: string;
        user: {
            profilePic: string;
            username: string;
        };
        media?: string[];
        content: string;
        engagement: {
            like: number;
            comments: number;
        };
    };
}

const PostCard = ({ post }: PostCardProps) => {
    return (
        <div className='p-5 rounded border-zinc-200 shadow border flex flex-col gap-5'>
            <Profile
                src={post.user.profilePic || './836.jpg'}
                username={post.user.username || 'text_34'}
            />
            {post.media && <Media src={post.media} />}
            <span>{post.content}</span>
            <Footer like={post.engagement.like} comment={post.engagement.comments} />
        </div>
    )
}

export default PostCard

