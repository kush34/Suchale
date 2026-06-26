import { Request, Response } from "express";
import Notification from "../models/notificationModel";

interface AuthRequest extends Request {
  id?: string;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.id })
      .populate("actor", "username")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const readNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!ids?.length) {
      return res.status(400).json({ message: "No notification ids provided" });
    }

    await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};