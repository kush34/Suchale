import { useState } from "react";
import ChatImageViewer from "@/components/ChatImageViewer";
import VideoViewer from "@/components/VideoViewer";
import MentionInput, { Mention } from "../mention/mention-input";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Image } from "lucide-react";
import { toast } from "sonner";

import api from "@/utils/axiosConfig";
import { trackEvent } from "@/lib/posthog";

type FileType = {
  file: File;
  type: "image" | "video" | "pdf";
  url: string;
};

type Hashtag = {
  tag: string;
};

type CreatePostProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CreatePost = ({ open, onOpenChange }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [mentions, setMentions] = useState<Mention[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [media, setMedia] = useState<FileType[]>([]);

  const extractHashtags = (text: string): Hashtag[] => {
    const matches = text.match(/#[A-Za-z0-9_]+/g) ?? [];

    return [...new Set(matches.map((h) => h.slice(1).toLowerCase()))].map(
      (tag) => ({
        tag,
      })
    );
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHashtags(extractHashtags(value));
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const picked = Array.from(e.target.files);

    const newMedia = picked.map((file) => {
      const url = URL.createObjectURL(file);

      let type: "image" | "video" | "pdf" = "image";

      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type === "application/pdf") type = "pdf";

      return {
        file,
        type,
        url,
      };
    });

    setMedia((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(media[index].url);

    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File) => {
    const { data } = await api.get("/post/preSignedUrl");

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("folder", data.folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await uploadRes.json();

    if (!result.secure_url) {
      throw new Error("Upload failed");
    }

    return result.secure_url;
  };

  const resetForm = () => {
    media.forEach((m) => URL.revokeObjectURL(m.url));

    setContent("");
    setMentions([]);
    setHashtags([]);
    setMedia([]);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error("Say something first");
      return;
    }

    setLoading(true);
    console.log({
      content,
      hashtags,
      payload: hashtags.map((h) => h.tag),
    });
    trackEvent("create_post_clicked", {
      has_media: media.length > 0,
    });

    try {
      let mediaUrls: string[] = [];

      if (media.length > 0) {
        mediaUrls = await Promise.all(
          media.map((m) => uploadToCloudinary(m.file))
        );
      }

      await api.post("/post", {
        content,
        media: mediaUrls,
        mentions,
        hashtags: hashtags.map((h) => h.tag),
      });

      toast.success("Post shared 🎉");

      trackEvent("post_shared", {
        media_count: mediaUrls.length,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not share your post");
      trackEvent("post_share_failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          if (!value) resetForm();
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>

              <p className="text-white mt-3 text-sm">
                Uploading...
              </p>
            </div>
          )}

          <div className="max-h-[70vh] overflow-y-auto p-6">
            <MentionInput
              className="resize-none min-h-32"
              value={content}
              onChange={handleContentChange}
              mentions={mentions}
              setMentions={setMentions}
              placeholder="Share your thoughts..."
            />

            {media.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {media.map((m, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute right-2 top-2 z-20 h-7 w-7 rounded-full bg-black/70 text-white"
                      >
                        ×
                      </button>

                      {m.type === "image" && (
                        <ChatImageViewer src={m.url} />
                      )}

                      {m.type === "video" && (
                        <VideoViewer src={m.url} />
                      )}

                      {m.type === "pdf" && (
                        <div className="h-40 rounded-lg border flex items-center justify-center">
                          PDF Preview
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {media.length} file(s) selected
                </p>
              </>
            )}
          </div>

          <div className="border-t px-6 py-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <Image size={18} />

              <span>Add media</span>

              <input
                className="hidden"
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileSelect}
              />
            </label>

            <Button
              onClick={handlePost}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;