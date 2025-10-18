import React, { useState } from "react";
import { PlayCircle } from "lucide-react"; 

const VideoViewer = ({ src }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-64 h-32 rounded overflow-hidden cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <video
          src={src}
          className="w-full h-full object-cover rounded transition group-hover:brightness-75"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle
            size={48}
            className="text-white/90 opacity-80 group-hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <video
            src={src}
            controls
            autoPlay
            className="max-w-3/4 max-h-3/4 object-contain rounded"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
};

export default VideoViewer;
