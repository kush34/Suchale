import mongoose from "mongoose";
import { io } from "../index";
import Notification from "../models/notificationModel";
import sendNotification from "../utils/webpush";
import { getSocketIdsByUsername } from "../socket";

type MentionRecipient = {
  _id: mongoose.Types.ObjectId;
  username: string;
  pushSubscription?: Record<string, any> | null;
};

interface NotifyMentionsPayload {
  actorId: string;
  actorUsername: string;
  postId: string;
  postContent: string;
  recipients: MentionRecipient[];
}

const buildPushPayload = (payload: {
  actorUsername: string;
  postId: string;
  postContent: string;
}) =>
  JSON.stringify({
    title: "You were mentioned",
    body: `${payload.actorUsername} mentioned you in a post`,
    icon: "/icon.png",
    data: {
      url: `/post/${payload.postId}`,
      preview: payload.postContent.slice(0, 120),
    },
  });

export const notifyMentionedUsers = async ({
  actorId,
  actorUsername,
  postId,
  postContent,
  recipients,
}: NotifyMentionsPayload) => {
  const uniqueRecipients = Array.from(
    new Map(
      recipients.map((recipient) => [recipient._id.toString(), recipient])
    ).values()
  ).filter((recipient) => recipient._id.toString() !== actorId);

  await Promise.all(
    uniqueRecipients.map(async (recipient) => {
      try {
        const notification = await Notification.create({
          recipient: recipient._id,
          actor: actorId,
          post: postId,
          type: "mention",
          message: `${actorUsername} mentioned you in a post`,
          read: false,
        });

        const socketIds = await getSocketIdsByUsername(recipient.username);
        const notificationPayload = {
          _id: notification._id,
          recipient: recipient._id,
          actor: actorId,
          post: postId,
          type: "mention",
          message: notification.message,
          read: notification.read,
          createdAt: notification.createdAt,
        };

        if (socketIds.length) {
          console.log(`New notification to ${recipient.username}`)
          for (const id of socketIds) io.to(id).emit("newNotification", notificationPayload);
        }

        if (recipient.pushSubscription) {
          await sendNotification.sendNotification(
            recipient.pushSubscription,
            buildPushPayload({
              actorUsername,
              postId,
              postContent,
            })
          );
        }
      } catch (error) {
        console.error("Failed to notify mentioned user:", error);
      }
    })
  );
};
