import {
  ImagePlay,
  SendHorizontal,
  SmilePlus,
  BadgePlus,
  X,
} from "lucide-react";
import React, { Ref, SetStateAction, useState } from "react";

import EmojiPicker from "@/components/EmojiPicker";

import { Grid } from "@giphy/react-components";
import { gf } from "@/lib/giphy";
import type { IGif } from "@giphy/js-types";

type Props = {
  message: string;

  mediaTrigger: () => void;
  mediaInpRef: Ref<HTMLInputElement>;
  sendMedia: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  showPicker: boolean;
  setShowPicker: React.Dispatch<SetStateAction<boolean>>;
  handleEmojiClick: (emoji: string) => void;

  setMessage: React.Dispatch<SetStateAction<string>>;
  handleTyping: () => void;
  sendMsg: (content: string) => void;

  sendGif: (gif: IGif) => void;
};

export default function MsgBar({
  message,
  setMessage,
  sendMedia,
  mediaInpRef,
  mediaTrigger,
  sendMsg,
  showPicker,
  setShowPicker,
  handleEmojiClick,
  handleTyping,
  sendGif,
}: Props) {
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [search, setSearch] = useState("");

  const fetchGifs = (offset: number) => {
    if (search.trim()) {
      return gf.search(search, {
        offset,
        limit: 20,
      });
    }

    return gf.trending({
      offset,
      limit: 20,
    });
  };

  return (
    <>
      {showGifPicker && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
          <div className="bg-background rounded-lg w-[700px] h-[650px] flex flex-col shadow-xl">
            <div className="flex items-center gap-2 p-4 border-b">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GIFs..."
                className="flex-1 border rounded px-3 py-2 outline-none"
              />

              <button
                onClick={() => setShowGifPicker(false)}
                className="p-2 hover:bg-muted rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <Grid
                width={660}
                columns={3}
                gutter={8}
                fetchGifs={fetchGifs}
                key={search}
                onGifClick={(gif, e) => {
                  e.preventDefault();

                  sendGif(gif);

                  setShowGifPicker(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className="
                fixed bottom-[var(--nav-h)] left-0 w-full
                z-[101]
                h-[var(--input-h)]
                flex
                bg-muted
                text-muted-foreground
                py-2

                xl:static
                md:w-full
            "
      >
        <div className="w-1/6 flex justify-evenly items-center">
          <button onClick={mediaTrigger} className="hover:scale-110 transition">
            <ImagePlay />

            <input
              ref={mediaInpRef}
              onChange={sendMedia}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </button>

          <button
            onClick={() => setShowGifPicker(true)}
            className="hover:scale-110 transition"
          >
            <BadgePlus />
          </button>

          <div className="relative">
            {showPicker && (
              <div className="absolute bottom-full mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <button
              onClick={() => setShowPicker(!showPicker)}
              className="hover:scale-110 transition"
            >
              <SmilePlus />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center px-2">
          <input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim()) {
                sendMsg(message);
                setMessage("");
              }
            }}
            className="w-full rounded px-2 py-1 outline-none"
            placeholder="Type your message..."
          />
        </div>

        <button
          onClick={() => {
            if (!message.trim()) return;

            sendMsg(message);
            setMessage("");
          }}
          className="w-16 flex items-center justify-center hover:scale-110 transition"
        >
          <SendHorizontal />
        </button>
      </div>
    </>
  );
}
