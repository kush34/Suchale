import { useEffect, useLayoutEffect, useRef, useState } from "react";
import api from "@/utils/axiosConfig";

export type MentionUser = {
  _id: string;
  username: string;
  profilePic: string;
};

type InputChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
type KeyDownEvent = React.KeyboardEvent<HTMLTextAreaElement>;

const MENTION_TRIGGER = /(^|[\s(])@([a-zA-Z0-9_]*)$/;
const MENTION_DEBOUNCE_MS = 250;

export function useMentions(
  value: string,
  onChange: (value: string) => void
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const valueRef = useRef(value);
  const pendingSelectionRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useLayoutEffect(() => {
    if (pendingSelectionRef.current === null) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = pendingSelectionRef.current;
    pendingSelectionRef.current = null;

    textarea.focus();
    textarea.setSelectionRange(selection, selection);
  }, [value]);

  const closeMentions = () => {
    setShowMentions(false);
    setMentionUsers([]);
    setMentionQuery("");
    setMentionStart(null);
    setActiveIndex(0);
    setIsLoading(false);
  };

  const handleInputChange = (e: InputChangeEvent) => {
    const text = e.target.value;
    onChange(text);

    const cursorPos = e.target.selectionStart ?? text.length;
    const beforeCursor = text.slice(0, cursorPos);
    const match = beforeCursor.match(MENTION_TRIGGER);

    if (!match) {
      closeMentions();
      return;
    }

    const query = match[2] ?? "";
    const start = beforeCursor.length - query.length - 1;

    setMentionQuery(query);
    setMentionStart(start);
    setShowMentions(query.length > 0);
    setActiveIndex(0);
  };

  const selectMention = (username: string) => {
    if (mentionStart === null) return;

    const currentValue = valueRef.current; // ✅ always fresh
    const end = mentionStart + mentionQuery.length + 1;
    const before = currentValue.slice(0, mentionStart);
    const after = currentValue.slice(end);
    const nextValue = `${before}@${username} ${after}`;

    pendingSelectionRef.current = `${before}@${username} `.length;
    onChange(nextValue);

    closeMentions();
  };

  const selectActiveMention = () => {
    const user = mentionUsers[activeIndex];
    if (!user) return;

    selectMention(user.username);
  };

  const handleKeyDown = (e: KeyDownEvent) => {
    if (!showMentions || mentionUsers.length === 0) {
      if (e.key === "Escape") {
        closeMentions();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((current) => (current + 1) % mentionUsers.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((current) =>
        current === 0 ? mentionUsers.length - 1 : current - 1
      );
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectActiveMention();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeMentions();
    }
  };

  useEffect(() => {
    if (!showMentions || mentionQuery.length === 0) {
      setMentionUsers([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const currentRequestId = ++requestIdRef.current;
        setIsLoading(true);
        const res = await api.get("/user/mention", {
          params: { q: mentionQuery },
        });
        if (cancelled || currentRequestId !== requestIdRef.current) return;
        setMentionUsers(res.data.data || []);
      } catch {
        if (cancelled) return;
        setMentionUsers([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, MENTION_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [mentionQuery, showMentions]);

  return {
    textareaRef,
    handleInputChange,
    handleKeyDown,
    showMentions,
    mentionUsers,
    selectMention,
    activeIndex,
    isLoading,
    closeMentions,
  };
}
