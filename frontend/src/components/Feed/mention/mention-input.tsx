import { useEffect, useMemo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Command,
    CommandGroup,
    CommandEmpty,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { useMentions } from "@/hooks/use-mention";

export interface Mention {
    id: string;
    username: string;
}

interface User {
    _id: string;
    username: string;
    profilePic: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;

    mentions: Mention[];
    setMentions: React.Dispatch<React.SetStateAction<Mention[]>>;

    placeholder?: string;
}

function renderHighlightedText(
    text: string,
    mentions: Mention[]
) {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    const matches: {
        start: number;
        end: number;
        mention: Mention;
    }[] = [];

    mentions.forEach((mention) => {
        const token = `@${mention.username}`;

        let index = text.indexOf(token);

        while (index !== -1) {
            matches.push({
                start: index,
                end: index + token.length,
                mention,
            });

            index = text.indexOf(
                token,
                index + token.length
            );
        }
    });

    matches.sort((a, b) => a.start - b.start);

    matches.forEach((match) => {
        if (match.start > cursor) {
            parts.push(
                <span key={`text-${cursor}`}>
                    {text.slice(cursor, match.start)}
                </span>
            );
        }

        parts.push(
            <span
                key={`${match.mention.id}-${match.start}`}
                className="
          rounded
          bg-blue-100
          px-1
          font-medium
          text-blue-700
          dark:bg-blue-900/40
          dark:text-blue-300
        "
            >
                @{match.mention.username}
            </span>
        );

        cursor = match.end;
    });

    if (cursor < text.length) {
        parts.push(
            <span key={`text-end`}>
                {text.slice(cursor)}
            </span>
        );
    }

    return parts;
}

export default function MentionInput({
    value,
    onChange,
    mentions,
    setMentions,
    placeholder,
}: Props) {
    const addMention = (user: User) => {
        setMentions((prev) => {
            const exists = prev.some((m) => m.id === user._id);
            if (exists) return prev;

            return [
                ...prev,
                {
                    id: user._id,
                    username: user.username,
                },
            ];
        });
    };

    const {
        textareaRef,
        handleInputChange,
        handleKeyDown,
        mentionUsers,
        activeIndex,
        isLoading,
        showMentions,
        selectMention,
        closeMentions,
    } = useMentions(value, onChange, addMention);

    const highlightedText = useMemo(
        () => renderHighlightedText(value, mentions),
        [value, mentions]
    );

    const handleSelectMention = (user: User) => {
        console.log("SELECTED USER", user);

        addMention(user);
        selectMention(user.username);
    };
    useEffect(() => {
        setMentions((prev) =>
            prev.filter((mention) =>
                value.includes(`@${mention.username}`)
            )
        );
    }, [value, setMentions]);

    return (
        <div className="relative">
            <div className="relative">
                {/* Highlight Layer */}
                <div
                    className="
            absolute
            inset-0
            pointer-events-none

            whitespace-pre-wrap
            break-words

            rounded-md
            border

            p-3

            text-sm
            leading-6

            text-foreground
          "
                >
                    {highlightedText}
                </div>

                {/* Actual Input */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={closeMentions}
                    placeholder={placeholder}
                    className="
            relative
            z-10

            min-h-[120px]
            w-full

            resize-y

            rounded-md
            border

            bg-transparent

            p-3
            
            text-sm
            leading-6

            text-transparent
            caret-foreground

            focus:outline-none
            focus:ring-2
            focus:ring-ring
          "
                />
            </div>

            {showMentions && (
                <div
                    onMouseDown={(e) => e.preventDefault()} // ✅ prevents textarea blur before onSelect fires
                    className="
      absolute left-0 right-0 top-full z-50 mt-1
      rounded-md border bg-background shadow-md
    "
                >
                    <Command shouldFilter={false}>
                        <CommandList>
                            {isLoading && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Searching users...
                                </div>
                            )}

                            {!isLoading && mentionUsers.length === 0 && (
                                <CommandEmpty>No users found.</CommandEmpty>
                            )}

                            <CommandGroup heading="Users">
                                {mentionUsers.map((user: User, index: number) => (
                                    <CommandItem
                                        key={user._id}
                                        value={user.username}
                                        onMouseDown={() => handleSelectMention(user)}
                                        className={`flex items-center gap-3 ${index === activeIndex
                                            ? "bg-accent text-accent-foreground"
                                            : ""
                                            }`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={user.profilePic}
                                                alt={user.username}
                                            />
                                        </Avatar>
                                        <span>{user.username}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}
