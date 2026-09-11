import Message, { IMessage } from "../models/messageModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import redis from "../utils/redis";
import { io } from "../index";
import sendNotification from "../utils/webpush";
import Group from "../models/groupModel";
import { escapeRegExp, MAX_SEARCH_LEN } from "../utils/input";

// ponytail: single place for conversation authorization (issue #14).
// DM rule: peer must exist, neither side may have blocked the other.
// Group rule: requester must be a member (toString compare — includes() on
// ObjectId arrays compares references and always misses).
const isBlocked = (list: any, id: any) =>
  (list || []).some((u: any) => u.toString() === id.toString());

export const dmAccess = async (me: string, peer: string) => {
  const [meDB, peerDB] = await Promise.all([
    User.findOne({ username: me }).select("_id blockedUsers"),
    User.findOne({ username: peer }).select("_id blockedUsers"),
  ]);
  if (!meDB || !peerDB) throw new Error("User not found.");
  if (isBlocked(peerDB.blockedUsers, meDB._id) || isBlocked(meDB.blockedUsers, peerDB._id))
    throw new Error("Forbidden: you cannot message this user.");
};

export const groupAccess = async (userId: string, groupId: string) => {
  if (!mongoose.isValidObjectId(groupId)) throw new Error("Forbidden: not a group member.");
  const group = await Group.findById(groupId).select("users");
  if (!group || !group.users.some((u) => u.toString() === userId.toString()))
    throw new Error("Forbidden: not a group member.");
  return group;
};

export interface SendMsgPayload {
    fromUser: string;
    toUser?: string;
    groupId?: string;
    isGroup?: boolean;

    type: IMessage["type"];
    content?: string;
    media?: IMessage["media"];
}

const inferMessageType = (
    mediaUrl: string,
    media?: IMessage["media"],
    explicitType?: IMessage["type"]
): IMessage["type"] => {
    if (explicitType && explicitType !== "text") return explicitType;

    if (media?.mediaType === "gif") return "gif";
    if (media?.mediaType === "sticker") return "sticker";

    if (/\.(gif)(\?.*)?$/i.test(mediaUrl)) return "gif";
    if (/\.(png|jpe?g|webp|svg)(\?.*)?$/i.test(mediaUrl)) return "image";
    if (/\.(mp4|mov|webm|mkv|avi)(\?.*)?$/i.test(mediaUrl)) return "video";
    if (/\.(pdf|docx?|xlsx?|pptx?|txt|zip|rar)(\?.*)?$/i.test(mediaUrl)) return "file";

    return "text";
};

const buildMediaPayload = (
    mediaUrl: string,
    media?: IMessage["media"],
    type?: IMessage["type"]
): IMessage["media"] => {
    const resolvedType = inferMessageType(mediaUrl, media, type);

    return {
        provider: media?.provider ?? "custom",
        providerMediaId: media?.providerMediaId,
        mediaType: resolvedType === "gif" || resolvedType === "sticker" ? resolvedType : media?.mediaType,
        url: media?.url ?? mediaUrl,
        previewUrl: media?.previewUrl,
        width: media?.width,
        height: media?.height,
        mimeType: media?.mimeType,
    };
};

export const sendMessage = async ({
    fromUser,
    toUser,
    groupId,
    isGroup = false,

    type,
    content = "",
    media,
}: SendMsgPayload): Promise<IMessage> => {
    if (isGroup && groupId) {
        const sender = await User.findOne({ username: fromUser }).select("_id");
        if (!sender) throw new Error("User not found.");
        await groupAccess(sender._id.toString(), groupId);
    } else if (toUser) {
        await dmAccess(fromUser, toUser);
    }

    const resolvedContent = content || media?.url || "";
    const resolvedType = inferMessageType(resolvedContent, media, type);
    const resolvedMedia =
        media || resolvedType !== "text"
            ? buildMediaPayload(resolvedContent, media, resolvedType)
            : undefined;

    const newMsg = await Message.create({
        fromUser,
        toUser,
        groupId,

        type: resolvedType,
        content: resolvedContent,
        media: resolvedMedia,
    }) as IMessage;

    if (!isGroup && toUser) {
        const receiverSocketId = await redis.hget(
            "onlineUsers",
            toUser
        );

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("sendMsg", newMsg);
        } else {
            const dbUser = await User.findOne({
                username: toUser,
            });

            if (dbUser?.pushSubscription) {
                let notificationBody = `You received a message from ${fromUser}`;

                switch (type) {
                    case "image":
                        notificationBody = `${fromUser} sent you an image`;
                        break;

                    case "video":
                        notificationBody = `${fromUser} sent you a video`;
                        break;

                    case "gif":
                        notificationBody = `${fromUser} sent you a GIF`;
                        break;

                    case "sticker":
                        notificationBody = `${fromUser} sent you a sticker`;
                        break;

                    case "audio":
                        notificationBody = `${fromUser} sent you an audio message`;
                        break;

                    case "file":
                        notificationBody = `${fromUser} sent you a file`;
                        break;
                }

                sendNotification.sendNotification(
                    dbUser.pushSubscription,
                    JSON.stringify({
                        title: "New Message",
                        body: notificationBody,
                        icon: "/icon.png",
                        data: {
                            url: `/chat/${fromUser}`,
                        },
                    })
                );
            }
        }
    }

    if (isGroup && groupId) {
        const senderSocketId = await redis.hget(
            "onlineUsers",
            fromUser
        );

        if (senderSocketId) {
            const senderSocket =
                io.sockets.sockets.get(senderSocketId);

            if (senderSocket) {
                senderSocket.to(groupId).emit("sendMsgGrp", newMsg);
            }
        }
    }

    return newMsg;
};

export const reactToMsg = async (username: string, messageId: string, emoji: string) => {
  const dbMsg = await Message.findById(messageId);
  if (!dbMsg) {
    return { status: "error", code: 404, message: "Message does not exist." };
  }

  const dbUser = await User.findOne({ username });
  if (!dbUser) {
    return { status: "error", code: 404, message: `User does not exist : ${username}` };
  }

  // participant check: reactor must belong to this conversation
  if (dbMsg.groupId) {
    try {
      await groupAccess(dbUser._id.toString(), dbMsg.groupId.toString());
    } catch {
      return { status: "error", code: 403, message: "Forbidden: not a group member." };
    }
  } else if (dbMsg.fromUser !== username && dbMsg.toUser !== username) {
    return { status: "error", code: 403, message: "Forbidden: not part of this conversation." };
  }

  if (dbMsg.fromUser.toString() === dbUser.username.toString()) {
    return { status: "error", code: 400, message: "You cannot react to your own message." };
  }

  // Remove previous reaction (if any)
  await Message.updateOne(
    { _id: messageId },
    { $pull: { reactions: { userId: dbUser._id } } }
  );

  // Add new one
  const updatedMsg = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { reactions: { userId: dbUser._id, emoji } } },
    { new: true }
  );
  if (!updatedMsg) return { status: "error", code: 404, message: "could not find the msg." }

  if (updatedMsg.groupId) {
    const senderSocketId = await redis.hget("onlineUsers", username);
    if (senderSocketId) {
      const senderSocket = io.sockets.sockets.get(senderSocketId);
      if (senderSocket) {
        console.log(`sending emoji reaction to GROUP: ${updatedMsg.groupId}`)
        senderSocket.to(updatedMsg.groupId.toString()).emit("emojiReactionGroup", updatedMsg);
      }
    }
  }

  // DIRECT CHAT
  else {
    const otherUser =
      dbMsg.fromUser.toString() === (dbUser as any)._id.toString()
        ? dbMsg.toUser
        : dbMsg.fromUser;
    if (!otherUser) return { success: "error", code: 400, message: "could not react to the msg." }
    const receiverSocketId = await redis.hget("onlineUsers", otherUser);
    console.log(`other user:${receiverSocketId} : ${otherUser}`)
    if (receiverSocketId) {
      console.log(`sending emoji reaction to DM: ${updatedMsg.groupId}`)
      io.to(receiverSocketId).emit("emojiReactionDirect", updatedMsg);
    }
  }
  return { status: true, code: 200, message: "Reaction added/updated", data: updatedMsg };
};



export const updateMsgById = async (username: string, messageId: string, udpatedContent: string) => {

  const dbMsg = await Message.findById(messageId);
  if (!dbMsg) return { status: "error", code: 404, message: "Msg Does not exist." }

  if (dbMsg.fromUser !== username) return { status: "error", code: 400, Message: "You can only udpate Msg which belong to you." }

  dbMsg.content = udpatedContent;
  dbMsg.isEdited = true;

  await dbMsg.save();
  return { status: "success", code: 200, message: "Msg Udpated Successfully.", data: dbMsg }
}

export const deletedMsgById = async (username: string, messageId: string) => {

  const dbMsg = await Message.findById(messageId);
  if (!dbMsg) return { status: "error", code: 404, message: "Msg Does not exist." }

  if (dbMsg.fromUser !== username) return { status: "error", code: 400, Message: "You can only udpate Msg which belong to you." }

  dbMsg.isDeleted = true;
  dbMsg.content = "Msg Deleted By User";

  await dbMsg.save();
  return { status: "success", code: 200, message: "Msg Udpated Successfully.", data: dbMsg }
}

// Types
interface GetMessagesPayload {
  username: string;
  toUser?: string;
  groupId?: string;
  isGroup: boolean;
  page?: number;
  limit?: number;
}

interface CreateGroupPayload {
  name: string;
  photoURL?: string;
  users: string[]; // user IDs
  adminId: string;
}

export const getMessagesService = async ({
  username,
  toUser,
  groupId,
  isGroup,
  page = 1,
  limit = 20
}: GetMessagesPayload) => {
  const skip = (page - 1) * limit;

  if (isGroup && !groupId) throw new Error("groupId is required for group messages.");
  if (!isGroup && !toUser) throw new Error("toUser is required for direct messages.");

  let messages: IMessage[] = [];
  let countMsgs: number = 0;

  if (isGroup && groupId) {
    const requester = await User.findOne({ username }).select("_id");
    if (!requester) throw new Error("User not found.");
    const group = await groupAccess(requester._id.toString(), groupId);

    countMsgs = await Message.countDocuments({ groupId: group._id });

    messages = await Message.find({ groupId: group._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit) as IMessage[];
  } else if (!isGroup && toUser) {
    await dmAccess(username, toUser);

    countMsgs = await Message.countDocuments({
      $or: [
        { fromUser: username, toUser },
        { fromUser: toUser, toUser: username }
      ]
    });

    messages = await Message.find({
      $or: [
        { fromUser: username, toUser },
        { fromUser: toUser, toUser: username }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as IMessage[];

    messages.reverse();

    await Message.updateMany(
      { fromUser: toUser, toUser: username, read: false },
      { $set: { read: true } }
    );
  }

  return {
    messages,
    hasMore: countMsgs > page * limit
  };
};

export const sendMediaService = async (
  fromUser: string,
  toUser: string,
  mediaUrl: string,
  type?: IMessage["type"],
  media?: IMessage["media"]
) => {
  await dmAccess(fromUser, toUser);

  const resolvedType = inferMessageType(mediaUrl, media, type);
  const newMsg = await Message.create({
    fromUser,
    toUser,
    type: resolvedType,
    content: mediaUrl,
    media: media ?? buildMediaPayload(mediaUrl, media, resolvedType),
  });

  const receiverSocketId = await redis.hget("onlineUsers", toUser);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("sendMsg", newMsg);
  }

  return { url: mediaUrl, newMsg };
};


export const getChatAssets = async (
  currentUser: string,
  query: any
) => {
  const {
    username,
    groupId,
    search = "",
  } = query;

  if (!username && !groupId)
    throw new Error("Chat not specified");

  if (groupId) {
    const requester = await User.findOne({ username: currentUser }).select("_id");
    if (!requester) throw new Error("User not found.");
    await groupAccess(requester._id.toString(), groupId);
  } else if (username) {
    await dmAccess(currentUser, username);
  }

  const match: any = groupId
    ? {
        groupId,
      }
    : {
        $or: [
          {
            fromUser: currentUser,
            toUser: username,
          },
          {
            fromUser: username,
            toUser: currentUser,
          },
        ],
      };

  const messages = await Message.find(match)
    .sort({ createdAt: -1 })
    .lean();

  const media: any[] = [];
  const files: any[] = [];
  const links: any[] = [];
  const searchResults: any[] = [];

  const imageRegex =
    /\.(jpg|jpeg|png|gif|webp|svg)$/i;

  const videoRegex =
    /\.(mp4|mov|avi|mkv|webm)$/i;

  const fileRegex =
    /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|txt)$/i;

  const urlRegex =
    /(https?:\/\/[^\s]+)/i;

  const lowerSearch = search.toLowerCase();

  for (const msg of messages) {
    const content = msg.content || "";

    if (
      imageRegex.test(content) ||
      videoRegex.test(content)
    ) {
      media.push(msg);
    }

    if (fileRegex.test(content)) {
      files.push(msg);
    }

    if (urlRegex.test(content)) {
      links.push(msg);
    }

    if (
      search &&
      content
        .toLowerCase()
        .includes(lowerSearch)
    ) {
      searchResults.push(msg);
    }
  }

  return {
    media,
    files,
    links,
    messages: search
      ? searchResults
      : [],
  };
};

export const createGroupService = async ({ name, photoURL, users, adminId }: CreateGroupPayload) => {
  const memberIds = [...new Set([...(users || []), adminId])];
  if (memberIds.some((id) => !mongoose.isValidObjectId(id)))
    throw new Error("Unknown user in group members.");
  const existing = await User.countDocuments({ _id: { $in: memberIds } });
  if (existing !== memberIds.length) throw new Error("Unknown user in group members.");

  const newGroup = await Group.create({
    name,
    photoURL,
    users: [...users, adminId],
    admin: adminId
  });

  await User.updateMany(
    { _id: { $in: users } },
    { $addToSet: { groups: newGroup._id } }
  );

  await User.updateOne(
    { _id: adminId },
    { $addToSet: { groups: newGroup._id } }
  );

  return newGroup;
};

export const getMembersByGroupIdService = async (username: string, groupId: string) => {
  const [userDB, groupDB] = await Promise.all([
    User.findOne({ username }),
    Group.findById(groupId)
  ]);

  if (!groupDB) throw new Error("Group not found.");
  if (!userDB) throw new Error("User not found.");
  try {
    await groupAccess(userDB._id.toString(), groupId);
  } catch {
    throw new Error(`User not member of ${groupDB.name}.`);
  }

  const members = await User.find({ _id: { $in: groupDB.users } }).select("username profilePic");

  return members;
};


export const searchUserMsgs = async (
  username: string,
  searchQuery: string,
  toUser?: string
) => {

  const baseFilter: any = {
    $or: [
      { fromUser: username },
      { toUser: username }
    ],
    content: { $regex: escapeRegExp(searchQuery.slice(0, MAX_SEARCH_LEN)), $options: "i" }
  };

  if (toUser) {
    baseFilter.toUser = toUser;
  }

  const messages = await Message.find(baseFilter);

  return {
    status: "success",
    code: 200,
    data: messages
  };
}
