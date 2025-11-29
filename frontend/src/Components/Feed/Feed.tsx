// import React from 'react'
// import PostCard from './PostCard'

// // const samplePost = {
// //   post_id: "1",
// //   user: {
// //     profilePhoto: './836.jpg',
// //     username: 'kush_34'
// //   },
// //   content: "This is great",
// //   engagement: {
// //     like: 10,
// //     comments: 5,
// //   }
// // }

// // const posts = [
// //   {
// //     post_id: "1",
// //     user: {
// //       profilePhoto: "https://picsum.photos/200?random=1",
// //       username: "kush_34",
// //     },
// //     media: [
// //       "https://picsum.photos/600/400?random=11",
// //       "https://picsum.photos/600/400?random=12"
// //     ],
// //     content: "Life is good 😎",
// //     engagement: {
// //       like: 42,
// //       comments: 12,
// //     },
// //   },

// //   {
// //     post_id: "2",
// //     user: {
// //       profilePhoto: "https://picsum.photos/200?random=2",
// //       username: "dev_god",
// //     },
// //     media: [
// //       "https://picsum.photos/600/400?random=21"
// //     ],
// //     content: "Shipping code at 3AM hits different.",
// //     engagement: {
// //       like: 100,
// //       comments: 33,
// //     },
// //   },

// //   {
// //     post_id: "3",
// //     user: {
// //       profilePhoto: "https://picsum.photos/200?random=3",
// //       username: "frontend_simp",
// //     },
// //     media: [
// //       "https://picsum.photos/600/400?random=31",
// //       "https://picsum.photos/600/400?random=32",
// //       "https://picsum.photos/600/400?random=33"
// //     ],
// //     content: "Tailwind > everything else. Fight me.",
// //     engagement: {
// //       like: 999,
// //       comments: 120,
// //     },
// //   },
// // ];


// const Feed = () => {
//   return (
//     <div className='w-1/3 grid gap-1'>
//       {posts.map((post) =>
//         <PostCard post={post} />
//       )}
//     </div>
//   )
// }

// export default Feed

import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import api from "@/utils/axiosConfig";

interface Post {
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

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) return <p className="text-center py-4">Loading feed...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;

  return (
    <div className="w-1/3 grid gap-4">
      {posts.length === 0 ? (
        <p className="text-center py-4">No posts yet</p>
      ) : (
        posts.map((post) => <PostCard key={post.post_id} post={post} />)
      )}
    </div>
  );
};

export default Feed;
