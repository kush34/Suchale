import { useEffect, useRef, useState } from "react";
import Feed from "@/components/Feed/Feed";
import CreatePost from "@/components/Feed/Post/CreatePost";
import { trackEvent } from "@/lib/posthog";
import StoryViewer from "@/components/story/story-viewer";
import StoryDrawer from "@/components/story/story-drawer";
import { Button } from "./Login";
import { Pen } from "lucide-react";

const FeedPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  useEffect(() => {
    trackEvent("feed_viewed");
  }, []);

  return (
    <div ref={scrollContainerRef} className="w-full h-screen overflow-y-auto">
      <StoryViewer />
      <div className="flex flex-col justify-center items-center gap-2 mt-4 xl:mt-8 p-5 xl:p-0">
        <CreatePost
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
        />
        <StoryDrawer />
        <Button className="bg-secondary" onClick={() => setCreatePostOpen(true)}>
          <Pen/>
        </Button>
        <Feed scrollContainer={scrollContainerRef} />
      </div>
    </div>
  );
};

export default FeedPage;
