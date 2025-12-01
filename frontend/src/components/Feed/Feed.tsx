import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import api from "@/utils/axiosConfig";

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
      content: string;
      createdAt: Date;
    }[];
    isLiked: boolean;
  };
  likeToggle: (id: string) => void;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/post/feed");
      setPosts(res.data.posts || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };
  const UpdateLike = (id: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post._id === id) {
          return {
            ...post,
            engagement: {
              ...post.engagement,
              isLiked: !post.engagement.isLiked
            }
          };
        }
        return post
      })
    )
  }
  useEffect(() => {
    fetchFeed();
  }, []);
  useEffect(() => { }, [UpdateLike])
  if (loading) return <p className="text-center py-4">Loading feed...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;

  return (
    <div className="w-1/3 grid gap-4">
      {posts.length === 0 ? (
        <p className="text-center py-4">No posts yet</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} likeToggle={UpdateLike} />)
      )}
    </div>
  );
};

export default Feed;
