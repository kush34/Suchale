import { lazy, Suspense, useContext } from "react";
import type { EmojiClickData } from "emoji-picker-react";

import { ThemeContext } from "@/Store/ThemeContext";

const EmojiPickerLib = lazy(() => import("emoji-picker-react"));

type Props = {
  onEmojiClick: (emoji: string) => void;
};

function EmojiPicker({ onEmojiClick }: Props) {
  const themeCtx = useContext(ThemeContext);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData.emoji);
  };

  return (
    <Suspense fallback={null}>
      <div className="rounded-2xl border p-2 shadow">
        <EmojiPickerLib
          theme={themeCtx?.theme === "dark" ? "dark" : "light"}
          onEmojiClick={handleEmojiClick}
        />
      </div>
    </Suspense>
  );
}

export default EmojiPicker;