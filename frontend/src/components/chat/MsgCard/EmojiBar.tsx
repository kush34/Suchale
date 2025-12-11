import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// EmojiBar.tsx
type EmojiBarProps = {
    onReact: (e:string)=>void;
}
const EmojiBar = ({ onReact }:EmojiBarProps) => (
  <ContextMenuContent className="flex">
    {["🔥", "❤️", "😭", "☠️"].map((e) => (
      <ContextMenuItem key={e} onClick={() => onReact(e)}>
        {e}
      </ContextMenuItem>
    ))}
  </ContextMenuContent>
);

export default EmojiBar