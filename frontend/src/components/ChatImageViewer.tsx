import { useState } from "react";

export default function ChatImageViewer({ src }: { src: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt="chat-img"
        className="w-64 h-32 object-cover rounded cursor-pointer"
        onClick={() => setIsOpen(true)}
      />

      {/* Fullscreen modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={src}
            alt="full"
            className="max-w-3/4 max-h-3/4 object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking image
          />
        </div>
      )}
    </>
  );
}
