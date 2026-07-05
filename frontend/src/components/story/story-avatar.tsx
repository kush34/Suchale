interface Props {
  src: string;
  username: string;

  viewed: boolean;

  onClick: () => void;
}

export default function StoryAvatar({ src, username, viewed, onClick }: Props) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div
        className={`rounded-full p-[2px] ${
          viewed
            ? "bg-zinc-500"
            : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
        }`}
      >
        <img
          src={src}
          className="h-16 w-16 rounded-full border-2 border-black object-cover"
        />
      </div>

      <span className="max-w-[72px] truncate text-xs">{username}</span>
    </button>
  );
}
