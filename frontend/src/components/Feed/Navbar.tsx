import { Bell, Home, Inbox, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Profile from "./Post/Profile";
import { useUser } from "@/Store/UserContext";
import api from "@/utils/axiosConfig";

const items = [
  { title: "Home",         url: "/feed",         icon: Home     },
  { title: "Messages",     url: "/messages",     icon: Inbox    },
  { title: "Search",       url: "/addContacts",  icon: Search   },
  { title: "Notification", url: "/notification", icon: Bell     },
  { title: "Settings",     url: "/settings",     icon: Settings },
];

export function AppSidebar() {
  const userCtx = useUser();
  const user = userCtx?.user;
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount
  useEffect(() => {
    api
      .get<{ count: number }>("/notifications/unread-count")
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});
  }, []);

  // Zero the badge as soon as the user opens the notification page
  useEffect(() => {
    if (location.pathname === "/notification") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="bg-background hidden xl:flex flex-col px-16 py-36 h-screen gap-24 border border-border">
      <div className="text-lg md:text-xl xl:text-2xl font-bold xl:px-3 xl:py-2 tracking-wide">
        Suchale
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Link
            key={item.url}
            className="flex text-xl gap-3 px-3 py-2 hover:scale-101 hover:text-foreground hover:bg-card rounded-xl duration-200 transition-ease-in"
            to={item.url}
          >
            {/* Bell gets a badge, everything else renders as-is */}
            {item.icon === Bell ? (
              <span className="relative">
                <Bell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
            ) : (
              <item.icon />
            )}
            {item.title}
          </Link>
        ))}
      </div>

      <div className="absolute bottom-10 footer">
        <Profile
          className="text-lg"
          toLink="/settings"
          username={user?.username}
          src={user?.profilePic}
        />
      </div>
    </div>
  );
}