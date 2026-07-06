import { Card, CardContent } from "@/components/ui/card";
import { Trending } from "@/pages/explore-page";

type Props = {
  trends: Trending[];
};

export default function TrendingSection({ trends }: Props) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">
        Trending
      </h2>

      <div className="space-y-2">
        {trends.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No trending topics right now
          </p>
        ) : (
          trends.map((trend) => (
            <Card
              key={trend.id}
              className="cursor-pointer border transition-colors hover:bg-muted/40"
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
  );
}