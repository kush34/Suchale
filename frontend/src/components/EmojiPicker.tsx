const emojis = ['😀', '😂', '🥰', '😎', '👍', '🔥'];

function EmojiQuickPicker({ onEmojiClick }: { onEmojiClick: (str: string) => void }) {
  return (
    <div className="p-2 border  rounded-2xl shadow">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiClick(emoji)}
          className="text-2xl m-1 hover:scale-125 cursor-pointer ease-in duration-200"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
export default EmojiQuickPicker