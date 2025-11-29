import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/utils/axiosConfig'
import PostCard from '@/components/Feed/PostCard';

interface UserProfile {
    username: string;
    profilePic: string;
    fullName: string;
    bio: string;
    followers: number;
    following: number;
    posts: {
        post_id: string;
        media?: string[];
        content: string;
        engagement: {
            like: number;
            comments: number;
        };
        user: {
            username: string;
            profilePic: string;
        };
    }[];
}

const ProfilePage = () => {
    const { username } = useParams();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
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
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.message || "Unable to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!username) return;
        getProfile(username);
    }, [username]);

    if (loading) return <p className="text-center p-4">Loading...</p>;
    if (error) return <p className="text-center p-4 text-red-500">{error}</p>;
    if (!user) return null;

    return (
        <div className="w-full max-w-2xl mx-auto p-5">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <img
                    src={user.profilePic}
                    className="w-24 h-24 rounded-full object-cover border"
                    alt="profile"
                />
                <div>
                    <h1 className="text-2xl font-semibold">{user.username}</h1>
                    <p className="text-sm">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.bio}</p>

                    <div className="flex gap-5 mt-2 text-sm">
                        <span>{user.followers} Followers</span>
                        <span>{user.following} Following</span>
                        <span>{user.posts.length} Posts</span>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-4">
                {user.posts.map((p) => (
                    <PostCard key={p.post_id} post={p} />
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;
