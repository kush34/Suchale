import { Home, Inbox, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import Profile from "./Post/Profile";
import { useUser } from "@/Store/UserContext";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/feed",
    icon: Home,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: Inbox,
  },
  {
    title: "Search",
    url: "/addContacts",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const userCtx = useUser();
  const user = userCtx?.user;
  if (!user) return null;
  return (
    <div className="bg-background hidden xl:flex flex-col px-16 py-36 h-screen gap-24 border border-border">
      <div className="text-lg md:text-xl xl:text-2xl font-bold xl:px-3 xl:py-2 tracking-wide ">
        Suchale
      </div>
      <div  className="grid gap-4">
        {items.map((item) => (
          <Link
            className="flex text-xl gap-3 px-3 py-2 hover:scale-101 hover:text-foreground hover:bg-card rounded-xl duration-200 transition-ease-in"
            to={item.url}
          >
            <item.icon />
            {item.title}
          </Link>
        ))}
      </div>
      <div className="absolute bottom-10 footer">
        <Profile className="text-lg" toLink="/settings" username={user?.username} src={user?.profilePic} />
      </div>
    </div>
  );
}
