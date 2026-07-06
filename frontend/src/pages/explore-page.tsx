import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";

import { Post, User } from "@/types";

import SearchBar from "@/components/explore-page/SearchBar";
import SearchResults from "@/components/explore-page/SearchResults";
import TrendingSection from "@/components/explore-page/TrendingSection";
import SuggestionsSection from "@/components/explore-page/SuggestionsSection";
import ExploreSkeleton from "@/components/explore-page/ExploreSkeleton";

export type Trending = {
  id: string;
  title: string;
  numberOfPosts: number;
};

export type SearchResultsType = {
  users: User[];
  posts: Post[];
};

export default function ExplorePage() {
  const [query, setQuery] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);

  const [discoverLoading, setDiscoverLoading] = useState(true);

  const [searchResults, setSearchResults] =
    useState<SearchResultsType>({
      users: [],
      posts: [],
    });

  const [trending, setTrending] = useState<Trending[]>([]);

  const [suggestions, setSuggestions] =
    useState<User[]>([]);

  const [error, setError] = useState("");

  const searching = query.trim().length > 0;

  useEffect(() => {
    loadDiscover();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  async function loadDiscover() {
    try {
      setDiscoverLoading(true);

      const [trendingRes, suggestionRes] =
        await Promise.all([
          api.get("/explore/trending"),
          api.get("/explore/suggestions"),
        ]);

      setTrending(trendingRes.data.trending);

      setSuggestions(suggestionRes.data.users);
    } catch {
      setError("Couldn't load explore page.");
    } finally {
      setDiscoverLoading(false);
    }
  }

  async function search() {
    if (query.trim().length < 2) {
      setSearchResults({
        users: [],
        posts: [],
      });

      return;
    }

    try {
      setSearchLoading(true);

      const { data } = await api.get(
        "/explore/search",
        {
          params: {
            q: query,
          },
        }
      );

      setSearchResults(data.results);
    } catch {
      setError("Search failed.");
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="mx-auto h-screen max-w-3xl overflow-y-auto scrollbar-hide px-6 py-6">

      <SearchBar
        value={query}
        onChange={setQuery}
      />

      {error && (
        <div className="mt-6 rounded-lg border border-destructive p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {searching ? (
        <SearchResults
          loading={searchLoading}
          results={searchResults}
        />
      ) : discoverLoading ? (
        <ExploreSkeleton />
      ) : (
        <div className="mt-8 space-y-10">

          <TrendingSection
            trends={trending}
          />

          <SuggestionsSection
            users={suggestions}
          />

        </div>
      )}

    </div>
  );
}