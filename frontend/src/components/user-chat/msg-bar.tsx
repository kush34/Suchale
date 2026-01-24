

import { ImagePlay, SendHorizontal, SmilePlus } from 'lucide-react';
import React, { Ref, SetStateAction } from 'react'
import EmojiPicker from '@/components/EmojiPicker';


type Props = {
    message: string;
    mediaTrigger: () => void;
    mediaInpRef: Ref<HTMLInputElement>;
    sendMedia: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    showPicker: boolean;
    handleEmojiClick: (emoji: string) => void;
    setShowPicker: React.Dispatch<SetStateAction<boolean>>
    setMessage: React.Dispatch<SetStateAction<string>>;
    handleTyping: () => void;
    sendMsg: (content: string) => void
}
export default function MsgBar({ message, setMessage, sendMedia, mediaInpRef, mediaTrigger, sendMsg, showPicker, setShowPicker, handleEmojiClick, handleTyping }: Props) {
    return (
        <div
            className={`
            fixed bottom-[var(--nav-h)] left-0 w-full
            z-[101] h-[var(--input-h)]
            flex media-emojis-textbar-sendbtn
            bg-muted text-muted-foreground py-2

            xl:static md:w-full md:right-0
            `}
        >
            <div className="w-1/7 items-center flex justify-evenly">
                <div
                    onClick={mediaTrigger}
                    className="cursor-pointer flex items-center justify-center hover:text-zinc-400 ease-in duration-100 hover:scale-110"
                >
                    <ImagePlay />
                    <input
                        ref={mediaInpRef}
                        onChange={sendMedia}
                        type="file"
                        className="hidden"
                    />
                </div>
                <div className="relative">
                    {showPicker && (
                        <div className="absolute bottom-full mb-2 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                    <button
                        className="cursor-pointer flex items-center justify-center ease-in duration-100 hover:scale-110"
                        onClick={() => setShowPicker(!showPicker)}
                    >
                        <SmilePlus />
                    </button>
                </div>
            </div>
            <div className="w-3/4 flex items-center justify-center mb-2">
                <input
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMsg(message);
                            setMessage("");
                        }
                    }}
                    type="text"
                    className={` w-full outline-none rounded px-2 py-1`}
                    placeholder="type your message here"
                />
            </div>
            <div
                onClick={() => {
                    sendMsg(message);
                    setMessage("");
                }}
                className="cursor-pointer flex items-center justify-center w-1/10 ease-in duration-100 hover:scale-110"
            >
                <SendHorizontal />
            </div>
        </div>
    )
}

