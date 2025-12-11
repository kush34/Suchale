import { EmojiReaction } from "@/types";
import React, { useEffect, useState } from "react";

const EmojiReactions = ({ reactions }: { reactions: EmojiReaction[] }) => {
    const [reactionsCount, setReactionsCount] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const map = new Map<string, number>();

        reactions.forEach((r) => {
            map.set(r.emoji, (map.get(r.emoji) || 0) + 1);
        });

        setReactionsCount(map);
    }, [reactions]);

    if (reactions.length === 0) return null;

    return (
        <div className="flex gap-1">
            {[...reactionsCount.entries()].map(([emoji, count]) => (
                <div
                    key={emoji}
                    className="bg-zinc-800 text-white text-xs px-2 py-px rounded-full 
                               flex items-center gap-1 border border-zinc-600 shadow"
                >
                    <span>{emoji}</span>
                    <span>{count}</span>
                </div>
            ))}
        </div>
    );
};  

export default EmojiReactions;
