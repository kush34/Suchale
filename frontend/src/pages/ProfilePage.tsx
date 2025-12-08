import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/axiosConfig";
import PostCard from "@/components/Feed/PostCard";
import { ProfileBlock } from "@/components/pages/profile/ProfileBlock";
import { Button } from "@/components/ui/button";

interface post {
  _id: string;
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
    isLiked: boolean;
  };
  user: {
    username: string;
    profilePic: string;
  };
}
interface UserProfile {
  _id:string;
  username: string;
  profilePic: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  posts: post[];
}

const ProfilePage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      const res = await api.get(`/user/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.data.user);
      setPosts(res.data.data.user.posts);
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };
  const UpdateLike = (id: string) => {
    setPosts(
      (prev) =>
        prev &&
        prev.map((post) => {
          if (post._id === id) {
            return {
              ...post,
              engagement: {
                ...post.engagement,
                isLiked: !post.engagement.isLiked,
              },
            };
          }
          return post;
        })
    );
  };
  useEffect(() => {
    if (!username) return;
    getProfile(username);
  }, [username]);

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center p-4 text-red-500">{error}</p>;
  if (!user) return null;

  return (
    <div className="w-full max-w-xl mx-auto p-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.profilePic}
          className="w-24 h-24 rounded-full object-cover"
          alt="profile"
        />
        <div>
          <span className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <ProfileBlock username={user.username} />
          </span>
          <p className="text-sm">{user.fullName}</p>
          <p className="text-sm text-gray-500">{user.bio}</p>
          <div className="flex gap-5 mt-2 text-sm">
            <span>{user.followers} Followers</span>
            <span>{user.following} Following</span>
            <span>{posts && posts.length} Posts</span>
          </div>
          <div className="actions mt-5">
            <Button>Follow</Button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {posts &&
          posts.map((p) => (
            <PostCard key={p._id} post={p} likeToggle={UpdateLike} />
          ))}
      </div>
    </div>
  );
};

export default ProfilePage;
