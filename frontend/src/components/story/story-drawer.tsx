import { useUser } from "@/Store/UserContext";
import { useStory } from "@/Store/storyContext";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useRef } from "react";

const StoryDrawer = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useUser()
  const {
    uploadStory,
    storyFeed,
    openStory,
    loading
  } = useStory();

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadStory(file);

      // Allow selecting the same file again later
      e.target.value = "";
    } catch (err) {
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-16 animate-pulse rounded-full bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full xl:w-1/2 whitespace-nowrap">
      <div className="flex gap-4 px-4 py-3">
        {/* Your Story */}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleFile}
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <img
              src={user?.profilePic}
              className="h-16 w-16 rounded-full"
            />

            <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-1">
              <Plus size={12} className="text-white" />
            </div>
          </div>

          <span>Your Story</span>
        </button>


        {storyFeed.map((group) => (
          <button
            key={group.user._id}
            onClick={() => openStory(group.user._id)}
            className="flex flex-col items-center gap-1"
          >
            <div className="rounded-full bg-gradient-to-tr from-orange-400 via-pink-500 to-blue-600 p-[3px]">
              <img
                src={group.user.profilePic}
                className="h-16 w-16 rounded-full border-2 border-black object-cover"
              />
            </div>

            <span className="max-w-[72px] truncate text-xs">
              {group.user.username}
            </span>
          </button>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default StoryDrawer;
