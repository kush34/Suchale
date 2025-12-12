import ChatImageViewer from "@/components/ChatImageViewer";
import { Button } from "@/components/ui/button";
import VideoViewer from "@/components/VideoViewer";
import api from "@/utils/axiosConfig";
import { Image } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type fileType = {
  file: File;
  type: "image" | "video" | "pdf";
  url: string;
};
const CreatePost = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<fileType[]>([]);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const picked = Array.from(e.target.files);

    const newMedia = picked.map((file) => {
      const url = URL.createObjectURL(file);

      let type: "image" | "video" | "pdf" = "image";

      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type === "application/pdf") type = "pdf";

      return { file, type, url };
    });

    setMedia((prev) => [...prev, ...newMedia]);
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      // 1. Get pre-signed signature from backend
      const { data } = await api.get("/post/preSignedUrl");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", data.apiKey);
      formData.append("timestamp", data.timestamp);
      formData.append("signature", data.signature);
      formData.append("folder", data.folder);

      // 2. Upload to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await uploadRes.json();

      if (!result.secure_url) throw new Error("Upload failed");

      return result.secure_url;
    } catch (err) {
      throw err;
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return toast.error("Say something first");
    setLoading(true);

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
      });

      toast("Post shared 🎉");

      setContent("");
      setMedia([]);
    } catch (err) {
      toast.error("Could not share your post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full xl:w-2/5 border shadow-sm rounded-lg p-4 bg-card">
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
          <svg
            className="animate-spin h-5 w-5 text-current"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>

          <p className="text-white mt-2 text-sm">Uploading...</p>
        </div>
      )}

      <textarea
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full resize-none border  rounded p-3"
        rows={3}
      />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {media.map((m, i) => (
          <div key={i} className="relative w-full">
            {m.type === "image" && <ChatImageViewer src={m.url} />}

            {m.type === "video" && <VideoViewer src={m.url} />}

            {m.type === "pdf" && (
              <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-lg text-sm font-medium">
                PDF Preview
              </div>
            )}
          </div>
        ))}
      </div>
      {/* selected files preview count */}
      {media.length > 0 && (
        <p className="text-sm text-zinc-600 mt-2">
          {media.length} file(s) selected
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <label className="cursor-pointer flex items-center gap-2 text-sm text-zinc-600">
          <Image size={18} />
          <span>Add media</span>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/* , video/* , .pdf, .gif/*"
            onChange={handleFileSelect}
          />
        </label>

        <Button onClick={handlePost} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
