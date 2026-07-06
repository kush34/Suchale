import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreSkeleton() {
  return (
    <div className="mt-8 space-y-6">

      {/* Users skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <Skeleton className="h-11 w-11 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Posts skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />

        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border p-4"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>

    </div>
  );
}