import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStory } from "@/Store/storyContext";

const IMAGE_DURATION = 5000;

export default function StoryViewer() {
  const { currentUserStories, closeStory, markViewed } = useStory();

  const [index, setIndex] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const story = useMemo(() => {
    return currentUserStories?.stories[index];
  }, [currentUserStories, index]);

  useEffect(() => {
    if (!story) return;

    markViewed(story._id);

    if (story.media.resourceType === "image") {
      timer.current = setTimeout(() => {
        next();
      }, IMAGE_DURATION);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [story]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeStory();
      if (e.key === "ArrowLeft") previous();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [story]);

  if (!currentUserStories || !story) return null;

  function next() {
    if (!currentUserStories) return;

    if (index >= currentUserStories.stories.length - 1) {
      closeStory();
      return;
    }

    setIndex((i) => i + 1);
  }

  function previous() {
    if (!currentUserStories) return;

    if (index <= 0) return;

    setIndex((i) => i - 1);
  }
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Progress */}

        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {currentUserStories.stories.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 overflow-hidden rounded bg-zinc-700"
            >
              <motion.div
                className="h-full bg-white"
                initial={{
                  width: i < index ? "100%" : i === index ? "0%" : "0%",
                }}
                animate={{
                  width: i < index ? "100%" : i === index ? "100%" : "0%",
                }}
                transition={{
                  duration:
                    story.media.resourceType === "video"
                      ? (story.media.duration ?? 5)
                      : 5,
                  ease: "linear",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}

        <div className="absolute left-4 top-8 flex items-center gap-3">
          <img
            src={currentUserStories.user.profilePic}
            className="h-10 w-10 rounded-full"
          />

          <span className="font-medium text-white">
            {currentUserStories.user.username}
          </span>
        </div>

        <button
          onClick={closeStory}
          className="absolute right-5 top-6 text-white"
        >
          <X size={28} />
        </button>

        {/* Previous */}

        <button
          onClick={previous}
          className="absolute left-0 top-0 h-full w-1/3"
        />

        {/* Next */}

        <button
          onClick={next}
          className="absolute right-0 top-0 h-full w-1/3"
        />

        <div className="flex h-full items-center justify-center">
          {story.media.resourceType === "image" ? (
            <motion.img
              key={story._id}
              src={story.media.url}
              className="max-h-full max-w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ) : (
            <motion.video
              key={story._id}
              ref={videoRef}
              src={story.media.url}
              autoPlay
              playsInline
              controls={false}
              onEnded={next}
              className="max-h-full max-w-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>

        {index > 0 && (
          <button
            onClick={previous}
            className="absolute left-4 top-1/2 text-white"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        {index < currentUserStories.stories.length - 1 && (
          <button
            onClick={next}
            className="absolute right-4 top-1/2 text-white"
          >
            <ChevronRight size={36} />
          </button>
        )}

        {story.caption && (
          <div className="absolute bottom-10 left-0 right-0 text-center text-white">
            {story.caption}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
