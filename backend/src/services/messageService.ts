import Message, { IMessage } from "../models/messageModel";
import User from "../models/userModel";
import redis from "../utils/redis";
import { io } from "../index";
import sendNotification from "../utils/webpush";
import Group from "../models/groupModel";

interface SendMsgPayload {
  fromUser: string;
  toUser?: string;
  content: string;
  isGroup?: boolean;
  groupId?: string;
}

export const sendMessage = async ({
  fromUser,
  toUser,
  content,
  isGroup = false,
  groupId
}: SendMsgPayload): Promise<IMessage> => {

  // Save message to DB
  const newMsg = await Message.create({ fromUser, toUser, content, groupId }) as IMessage;

  // Direct message handling
  if (!isGroup && toUser) {
    const receiverSocketId = await redis.hget("onlineUsers", toUser);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("sendMsg", newMsg);
    } else {
      const dbUser = await User.findOne({ username: toUser });
      if (dbUser?.pushSubscription) {
        sendNotification.sendNotification(
          dbUser.pushSubscription,
          JSON.stringify({
            title: "New Message",
            body: `You received a message from ${fromUser}`,
            icon: "/icon.png",
            data: { url: `/chat/${fromUser}` }
          })
        );
      }
    }
  }

  // Group message handling
  if (isGroup && groupId) {
    const senderSocketId = await redis.hget("onlineUsers", fromUser);
    if (senderSocketId) {
      const senderSocket = io.sockets.sockets.get(senderSocketId);
      if (senderSocket) {
        senderSocket.to(groupId).emit("sendMsgGrp", newMsg);
      }
    }
  }

  return newMsg;
};


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
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found.");

    countMsgs = await Message.countDocuments({ groupId: group._id });

    messages = await Message.find({ groupId: group._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit) as IMessage[];
  } else if (!isGroup && toUser) {
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

export const sendMediaService = async (fromUser: string, toUser: string, filePath: string) => {
  const newMsg = await Message.create({ fromUser, toUser, content: filePath });

  const receiverSocketId = await redis.hget("onlineUsers", toUser);
  if (receiverSocketId) io.to(receiverSocketId).emit("sendMsg", newMsg);

  return { url: filePath, newMsg };
};

export const createGroupService = async ({ name, photoURL, users, adminId }: CreateGroupPayload) => {
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
  if (!groupDB.users.includes(userDB._id)) throw new Error(`User not member of ${groupDB.name}.`);

  const members = await User.find({ _id: { $in: groupDB.users } }).select("username profilePic");

  return members;
};
