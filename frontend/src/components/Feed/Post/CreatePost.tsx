import { Button } from "@/components/ui/button";
import api from "@/utils/axiosConfig";
import { Image } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
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
      // Upload all media first
      let mediaUrls: string[] = [];

      if (files.length > 0) {
        mediaUrls = await Promise.all(files.map(uploadToCloudinary));
      }

      // Submit post
      await api.post("/post", {
        content,
        media: mediaUrls,
      });

      toast("Post shared 🎉");

      // reset UI
      setContent("");
      setFiles([]);
    } catch (err) {
      toast.error("Could not share your post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/3 border shadow-sm rounded-lg p-4 bg-white">
      <textarea
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full resize-none border border-zinc-200 rounded p-3"
        rows={3}
      />

      {/* selected files preview count */}
      {files.length > 0 && (
        <p className="text-sm text-zinc-600 mt-2">
          {files.length} file(s) selected
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
            accept="image/*"
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
