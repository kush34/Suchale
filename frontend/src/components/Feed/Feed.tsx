import { useCallback, useEffect, useRef, useState } from "react";
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
}

interface FeedProps {
  scrollContainer: React.RefObject<HTMLDivElement>;
}

const LIMIT = 10;

// ── Skeleton ──────────────────────────────────────────────────────────────────

const PostSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-2.5 w-16 rounded bg-muted" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-5/6 rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
    </div>
    <div className="h-48 w-full rounded-lg bg-muted" />
    <div className="flex gap-4">
      <div className="h-3 w-12 rounded bg-muted" />
      <div className="h-3 w-12 rounded bg-muted" />
    </div>
  </div>
);

const FeedSkeleton = () => (
  <div className="w-full xl:w-1/2 grid gap-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);

// ── Feed ──────────────────────────────────────────────────────────────────────

const Feed = ({ scrollContainer }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);
  const pageRef = useRef(1);          // always-current page for the observer closure
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = useCallback(async (pageNumber: number, append = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const res = await api.get("/post/feed", { params: { page: pageNumber } });
      const newPosts: Post[] = res.data.posts ?? [];
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setHasMore(newPosts.length === LIMIT);
      pageRef.current = pageNumber;
    } catch (err) {
      console.error(err);
      setError("Failed to load feed");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // Infinite scroll — use the actual scroll container as root
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainer.current;
    if (loading || !sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
          fetchFeed(pageRef.current + 1, true);
        }
      },
      {
        root: container,      // ← the actual scrolling div, not the viewport
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetchFeed, loading, scrollContainer]);

  const updateLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== id) return post;
        return {
          ...post,
          engagement: {
            ...post.engagement,
            isLiked: !post.engagement.isLiked,
          },
        };
      })
    );
  };

  if (loading) return <FeedSkeleton />;
  if (error) return <p className="text-center py-4 text-destructive">{error}</p>;

  return (
    <div className="w-full xl:w-1/2 grid gap-2">
      {posts.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">No posts yet</p>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} likeToggle={updateLike} />
          ))}

          {loadingMore && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}

          {hasMore && <div ref={sentinelRef} className="h-1" />}

          {!hasMore && (
            <p className="text-center py-6 text-sm text-muted-foreground">
              You're all caught up
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;
