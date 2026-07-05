import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/utils/axiosConfig";

export interface StoryMedia {
  publicId: string;
  url: string;
  resourceType: "image" | "video";
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName?: string;
    profilePic: string;
  };
  media: StoryMedia;
  caption?: string;
  viewers: string[];
  createdAt: string;
}

export interface StoryGroup {
  user: Story["user"];
  stories: Story[];
}

interface UploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  tags?: string;
}

interface StoryContextType {
  storyFeed: StoryGroup[];

  storyMap: Record<string, StoryGroup>;

  loading: boolean;

  currentUserStories: StoryGroup | null;

  openStory: (userId: string) => void;

  closeStory: () => void;

  refreshStories: () => Promise<void>;

  uploadStory: (file: File, caption?: string) => Promise<void>;

  deleteStory: (storyId: string) => Promise<void>;

  markViewed: (storyId: string) => Promise<void>;

  hasStory: (userId: string) => boolean;

  storyStatus: (userId: string) => "none" | "seen" | "unseen";
}

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [storyFeed, setStoryFeed] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentUserStories, setCurrentUserStories] =
    useState<StoryGroup | null>(null);

  const storyMap = useMemo(() => {
    const map: Record<string, StoryGroup> = {};

    storyFeed.forEach((group) => {
      map[group.user._id] = group;
    });

    return map;
  }, [storyFeed]);

  const refreshStories = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/story/feed");

      setStoryFeed(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStories();
  }, [refreshStories]);

  const openStory = (userId: string) => {
    setCurrentUserStories(storyMap[userId] ?? null);
  };

  const closeStory = () => {
    setCurrentUserStories(null);
  };

  const markViewed = async (storyId: string) => {
    await api.put(`/story/${storyId}/view`);

    setStoryFeed((prev) =>
      prev.map((group) => ({
        ...group,
        stories: group.stories.map((story) =>
          story._id === storyId
            ? {
                ...story,
                viewers: [...story.viewers, "me"],
              }
            : story,
        ),
      })),
    );
  };

  const deleteStory = async (storyId: string) => {
    await api.delete(`/story/${storyId}`);

    await refreshStories();
  };

  const uploadStory = async (file: File, caption?: string) => {
    const sign = await api.post<UploadSignature>("/story/upload-signature");

    const form = new FormData();

    form.append("file", file);
    form.append("api_key", sign.data.apiKey);
    form.append("timestamp", String(sign.data.timestamp));
    form.append("signature", sign.data.signature);
    form.append("folder", sign.data.folder);

    if (sign.data.tags) {
      form.append("tags", sign.data.tags);
    }

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.data.cloudName}/auto/upload`,
      {
        method: "POST",
        body: form,
      },
    );

    const uploaded = await upload.json();

    await api.post("/story  ", {
      caption,
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      resourceType: uploaded.resource_type,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      duration: uploaded.duration,
    });

    await refreshStories();
  };

  const hasStory = (userId: string) => {
    return !!storyMap[userId];
  };

  const storyStatus = (userId: string): "none" | "seen" | "unseen" => {
    const group = storyMap[userId];

    if (!group) return "none";

    const seen = group.stories.every((story) => story.viewers.includes("me"));

    return seen ? "seen" : "unseen";
  };

  return (
    <StoryContext.Provider
      value={{
        storyFeed,
        storyMap,
        loading,
        currentUserStories,
        openStory,
        closeStory,
        refreshStories,
        uploadStory,
        deleteStory,
        markViewed,
        hasStory,
        storyStatus,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const ctx = useContext(StoryContext);

  if (!ctx) {
    throw new Error("useStory must be used inside StoryProvider");
  }

  return ctx;
};
