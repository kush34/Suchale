import PostCard from '@/components/Feed/PostCard';
import api from '@/utils/axiosConfig';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import CommentCard from "@/components/CommentCard";

interface Post {
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
            username: string;
            content: string;
            profilePic: string;
            createdAt: Date;
        }[];
        isLiked: boolean;
    };
    likeToggle: (id: string) => void;
}

const PostPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState("");

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/post/${postId}`);
            setPost(res.data.data);
        } catch (err) {
            toast.error("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const likeToggle = async (id: string) => {
        if (!post) return;

        try {
            await api.post(`/post/like/${id}`);

            setPost(prev =>
                prev
                    ? {
                        ...prev,
                        engagement: {
                            ...prev.engagement,
                            isLiked: !prev.engagement.isLiked,
                            likes: prev.engagement.isLiked
                                ? prev.engagement.likes.filter(l => l.user !== "CURRENT_USER_ID")
                                : [...prev.engagement.likes, { user: "CURRENT_USER_ID", likedAt: new Date().toString(), _id: Date.now().toString() }]
                        }
                    }
                    : prev
            );
        } catch (err) {
            toast.error("Like failed");
        }
    };

    // Add comment
    const addComment = async () => {
        if (!comment.trim()) return;

        try {
            const res = await api.post(`/post/comment/${postId}`, { content: comment });

            setPost(prev =>
                prev
                    ? {
                        ...prev,
                        engagement: {
                            ...prev.engagement,
                            comments: [...prev.engagement.comments, res.data.data] 
                        }
                    }
                    : prev
            );

            setComment("");
        } catch (err) {
            toast.error("Could not add comment");
        }
    };

    useEffect(() => {
        if (postId) fetchPost();
    }, []);

    if (loading || !post) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto py-4">

            <PostCard post={post} likeToggle={likeToggle} />

            <div className="mt-6 border p-4 rounded-xl">
                <h2 className="font-bold text-lg mb-3">Add a Comment</h2>

                <textarea
                    className="w-full p-2 border rounded-md resize-none"
                    placeholder="Write something..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                    onClick={addComment}
                    className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md"
                >
                    Comment
                </button>
            </div>

            {/* All Comments  */}
            <div className="mt-6">
                <h2 className="font-semibold mb-2">Comments</h2>

                {post.engagement.comments.length === 0 && (
                    <p className="text-sm text-gray-500">No comments yet</p>
                )}

                {post.engagement.comments.map((c, idx) => (
                    <CommentCard
                        key={idx}
                        username={c.username}
                        profilePic={c.profilePic}
                        content={c.content}
                        createdAt={c.createdAt}
                    />
                ))}

            </div>
        </div>
    );
};


export default PostPage