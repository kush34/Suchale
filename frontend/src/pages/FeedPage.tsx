import { useEffect, useRef } from "react";
import Feed from "@/components/Feed/Feed";
import CreatePost from "@/components/Feed/Post/CreatePost";
import { trackEvent } from "@/lib/posthog";

const FeedPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("feed_viewed");
  }, []);

  return (
    <div ref={scrollContainerRef} className="w-full h-screen overflow-y-auto">
      <div className="flex flex-col justify-center items-center gap-2 mt-4 xl:mt-8 p-5 xl:p-0">
        <CreatePost />
        <Feed scrollContainer={scrollContainerRef} />
      </div>
    </div>
  );
};

export default FeedPage;
