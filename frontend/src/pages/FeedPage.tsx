import React from "react";
import { AppSidebar } from "@/components/Feed/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Feed from "@/components/Feed/Feed";
import CreatePost from "@/components/Feed/Post/CreatePost";

const FeedPage = () => {
  return (
    <div className="w-full h-screen overflow-y-auto">
      <div className="flex flex-col justify-center items-center gap-2 mt-4 xl:mt-8 overflow-y-scrollno-scrollbar p-5 xl:p-0">
        <CreatePost />
        <Feed />
      </div>
    </div>
  );
};

export default FeedPage;
