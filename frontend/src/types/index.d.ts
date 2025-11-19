export interface User {
    pushSubscription: object,
    _id: string,
    username: string,
    email: string,
    profilePic: string,
    status: "online" | "offline" | "away" | "busy",
    blockedUsers: [],
    groups: string[],
    contacts: Contact[],
    createdAt: string,
    updatedAt: string,
    __v: 4
}

type Contact = {
    _id: string;
};


export interface Group {
    _id: string,
    name: string,
    profilePic: string,
    isGroup: true,
    lastMessage: Message
}

type EmojiReaction = {
    userId: string;
    emoji: string;
    _id: string;
}
export interface Message {
    _id: string,
    fromUser: string,
    toUser?: string,
    groupId: string | null,
    content: string,
    isEdited: boolean,
    read: boolean,
    isDeleted: boolean,
    reactions: EmojiReaction[],
    createdAt: string,
    updatedAt: string,
    __v: number
}

export interface Chat {
    _id: string;
    name: string;
    status: "online" | "offline" | "away" | "busy";
    username: string;
    profilePic: string;
    isGroup: boolean;
    lastMessage: Message;
}
