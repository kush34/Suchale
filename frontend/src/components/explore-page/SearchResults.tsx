import { Post } from "@/types";
import { User } from "@/types";

import PostCard from "../Feed/PostCard";

import UserResultCard from "./UserResultCard";
import EmptySearch from "./EmptySearch";
import ExploreSkeleton from "./ExploreSkeleton";

type Props = {
  loading: boolean;

  results: {
    users: User[];
    posts: Post[];
  };
};

export default function SearchResults({
  loading,
  results,
}: Props) {
  if (loading) {
    return <ExploreSkeleton />;
  }

  if (
    results.users.length === 0 &&
    results.posts.length === 0
  ) {
    return <EmptySearch />;
  }

  return (
    <div className="mt-8">

      {results.users.length > 0 && (
        <section>

          <h2 className="mb-4 text-lg font-semibold">
            Users
          </h2>

          <div className="space-y-3">

            {results.users.map((user) => (
              <UserResultCard
                key={user._id}
                user={user}
              />
            ))}

          </div>

        </section>
      )}

      {results.posts.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-lg font-semibold">
            Posts
          </h2>

          <div className="flex flex-col">

            {results.posts.map((post) => (
              <PostCard
                key={post._id}
                post={{
                  ...post,
                  isLiked: false,
                }}
                likeToggle={() => {}}
                source="feed"
              />
            ))}

          </div>

        </section>
      )}

    </div>
  );
}