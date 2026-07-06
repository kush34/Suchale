import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

type Props = {
  users: User[];
};

export default function SuggestionsSection({ users }: Props) {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">
        Who to follow
      </h2>

      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No suggestions available
          </p>
        ) : (
          users.map((user) => (
            <Card
              key={user._id}
              className="border transition-colors hover:bg-muted/40"
            >
              <CardContent className="flex items-center justify-between p-4">

                <div
                  onClick={() =>
                    navigate(`/profile/${user.username}`)
                  }
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">
                      {user.username}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <button className="rounded-full bg-black px-4 py-1.5 text-sm text-white hover:bg-black/90">
                  Follow
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}