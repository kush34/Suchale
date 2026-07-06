import { SearchX } from "lucide-react";

export default function EmptySearch() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" />

      <h3 className="mt-3 text-base font-medium">
        No results found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try searching for people, usernames, or posts.
      </p>
    </div>
  );
}