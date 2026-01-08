import { ThemeContext } from "@/Store/ThemeContext";
import EmojiPickerLib, { EmojiClickData, Theme } from "emoji-picker-react";
import { useContext } from "react";

type Props = {
  onEmojiClick: (emoji: string) => void;
};

function EmojiPicker({ onEmojiClick }: Props) {
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData.emoji);
  };

  return (
    <div className="p-2 border rounded-2xl shadow">
      <EmojiPickerLib theme={theme == "dark" ? Theme.DARK : Theme.LIGHT} onEmojiClick={handleEmojiClick} />
    </div>
  );
}

export default EmojiPicker;
