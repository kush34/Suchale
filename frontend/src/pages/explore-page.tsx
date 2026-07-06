import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/utils/axiosConfig";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Trending = {
  id: string;
  title: string;
  numberOfPosts: number;
};

type SearchResult = {
  id: string;
  type: "user" | "post";
  username?: string;
  name?: string;
  avatar?: string;

  content?: string;
  image?: string;
};

type SuggestedUser = {
  _id: string;
  username: string;
  profilePic: string;
};

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trending, setTrending] = useState<Trending[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(true);

  const navigate = useNavigate();

  const search = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);

      const { data } = await api.get("/explore/search", {
        params: {
          q: searchQuery,
        },
      });

      setSearchResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      setTrendingLoading(true);

      const { data } = await api.get("/explore/trending");

      setTrending(data.trending);
    } catch (err) {
      console.error(err);
    } finally {
      setTrendingLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setSuggestionLoading(true);

      const { data } = await api.get("/explore/suggestions");

      setSuggestions(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
    loadSuggestions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="mx-auto h-screen overflow-y-auto scrollbar-hide max-w-3xl px-6 py-8">
      <div className="space-y-10">

        {/* Search */}
        <section>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, posts..."
              className="h-12 rounded-xl border-border bg-background pl-11"
            />
          </div>

          <div className="mt-5 space-y-2">
            {searchLoading && (
              <p className="text-sm text-muted-foreground">
                Searching...
              </p>
            )}

            {!searchLoading &&
              searchResults.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer border transition-colors hover:bg-muted/40"
                >
                  <CardContent className="p-4">

                    {item.type === "user" ? (
                      <div className="flex items-center gap-3">

                        <Avatar className="h-11 w-11">
                          <AvatarImage src={item.profilePic} />
                          <AvatarFallback>
                            {item.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            @{item.username}
                          </p>
                        </div>

                      </div>
                    ) : (
                      <p className="line-clamp-3 text-sm leading-6">
                        {item.content}
                      </p>
                    )}

                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Trending */}

        <section>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Trending
            </h2>
          </div>

          <div className="space-y-2">

            {trendingLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            ) : (
              trending.map((trend) => (
                <Card
                  key={trend.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <CardContent className="p-4">

                    <p className="font-medium">
                      #{trend.title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {trend.numberOfPosts} posts
                    </p>

                  </CardContent>
                </Card>
              ))
            )}

          </div>

        </section>

        {/* Suggestions */}

        <section>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Who to follow
            </h2>
          </div>

          <div className="space-y-2">

            {suggestionLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            ) : (
              suggestions.map((user) => (
                <Card
                  key={user.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <CardContent className="flex items-center justify-between p-4">

                    <div
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className="flex cursor-pointer items-center gap-3"
                    >

                      <Avatar className="h-11 w-11">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>

                        <p className="font-medium hover:underline">
                          {user.username}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>

                      </div>

                    </div>

                    <Button
                      variant="secondary"
                      className="rounded-full"
                    >
                      Follow
                    </Button>

                  </CardContent>
                </Card>
              ))
            )}

          </div>

        </section>

      </div>
    </div>);
};

export default Explore;

