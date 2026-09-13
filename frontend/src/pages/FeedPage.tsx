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
    <div ref={scrollContainerRef} className="h-screen w-full overflow-y-auto">
      <StoryViewer />

      <div className="flex flex-col items-center justify-center gap-2 p-5 xl:mt-8 xl:p-0">
        <CreatePost open={createPostOpen} onOpenChange={setCreatePostOpen} />

        <StoryDrawer />

        <Feed scrollContainer={scrollContainerRef} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-1/10 right-1/10 z-50">
        <Button
          onClick={() => setCreatePostOpen(true)}
          className="h-12 w-12 rounded-full"
        >
          <Pen className="h-5 w-5 text-primary" />
        </Button>
      </div>
    </div>
  );
};

export default FeedPage;
