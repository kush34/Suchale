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


export type Post = {
  _id: string;

  user: User;

  content: string;
  media: string[];

  mentions: {
    userId: string;
    username: string;
  }[];

  hashtags: string[];

  engagement: {
    likes: {
      _id?: string;
      user: string;
      likedAt: string;
    }[];

    comments: {
      _id: string;
      userId: string;
      content: string;
      createdAt: string;
    }[];
  };

  createdAt: string;
  updatedAt: string;

  __v?: number;
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

export type MessageType = "text" | "image" | "video" | "audio" | "file" | "gif" | "sticker";

export type MessageMedia = {
    provider?: "giphy" | "tenor" | "discord" | "custom";
    providerMediaId?: string;
    mediaType?: "gif" | "sticker";
    url: string;
    previewUrl?: string;
    width?: number;
    height?: number;
    mimeType?: string;
};

export interface Message {
    _id: string,
    fromUser: string,
    toUser?: string,
    groupId: string | null,
    type: MessageType,
    content: string,
    media?: MessageMedia,
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
