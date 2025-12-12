import ChatImageViewer from "@/components/ChatImageViewer";
import FileViewer from "@/components/FileViewer";
import VideoViewer from "@/components/VideoViewer";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaProps {
  src: string[];
}

export default function Media({ src }: MediaProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const moreCount = src.length - 4;

  const isImage = (f: string) => /\.(jpeg|jpg|gif|png|webp)$/i.test(f);
  const isVideo = (f: string) => /\.(mp4)$/i.test(f);
  const isFile = (f: string) => /\.(pdf|docx|txt|rtf|odt)$/i.test(f);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  let gridCols =
    src.length === 1 ? "grid-cols-1" : src.length === 2 ? "grid-cols-2" : "grid-cols-2";

  return (
    <>
      <div className={`grid ${gridCols} gap-1 rounded overflow-hidden`}>
        {src.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className="relative cursor-pointer"
            onClick={() => openViewer(index)}
          >
            {isImage(item) ? (
              <img src={item} className="w-full object-cover rounded" />
            ) : isVideo(item) ? (
              <video src={item} className="w-full object-cover rounded" />
            ) : (
              <FileViewer src={item} filename={item} />
            )}

            {/* +N MORE OVERLAY */}
            {index === 3 && src.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-semibold rounded">
                +{moreCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {viewerOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setViewerOpen(false)}
        >
          <div className="relative max-w-[80%] max-h-[80%]" onClick={(e) => e.stopPropagation()}>
            {/* MAIN MEDIA VIEW */}
            {isImage(src[currentIndex]) ? (
              <img
                src={src[currentIndex]}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : isVideo(src[currentIndex]) ? (
              <video
                src={src[currentIndex]}
                controls
                className="max-w-full max-h-[80vh]"
              />
            ) : (
              <FileViewer src={src[currentIndex]} filename={src[currentIndex]} />
            )}

            {/* LEFT ARROW */}
            <button
              className="absolute top-1/2 left-[-50px] text-white"
              onClick={() =>
                setCurrentIndex((prev) => (prev === 0 ? src.length - 1 : prev - 1))
              }
            >
              <ChevronLeft size={32} />
            </button>

            {/* RIGHT ARROW */}
            <button
              className="absolute top-1/2 right-[-50px] text-white"
              onClick={() =>
                setCurrentIndex((prev) => (prev === src.length - 1 ? 0 : prev + 1))
              }
            >
              <ChevronRight size={32} />
            </button>

            {/* THUMBNAILS STRIP */}
            <div className="flex gap-2 mt-4 justify-center">
              {src.map((thumb, i) => (
                <img
                  key={i}
                  src={thumb}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border ${
                    currentIndex === i ? "border-blue-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
