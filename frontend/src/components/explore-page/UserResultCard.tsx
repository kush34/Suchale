import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

type Props = {
  user: User;
};

export default function UserResultCard({ user }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${user.username}`)}
      className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={user.profilePic} />
          <AvatarFallback>
            {user.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-medium">
            {user.username}
          </p>
          <p className="text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        View
      </div>
    </div>
  );
}