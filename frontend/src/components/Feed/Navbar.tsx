import { Home, Inbox, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="bg-background hidden xl:flex flex-col px-12 py-36 h-screen gap-5 border border-border">
      <div className="text-lg md:text-xl xl:text-2xl font-bold xl:px-3 xl:py-2 tracking-wide ">
        Suchale
      </div>
      {items.map((item) => (
        <Link
          className="flex gap-3 px-3 py-2 hover:scale-101 hover:text-foreground hover:bg-card rounded-xl duration-200 transition-ease-in"
          to={item.url}
        >
          <item.icon />
          {item.title}
        </Link>
      ))}
    </div>
  );
}
