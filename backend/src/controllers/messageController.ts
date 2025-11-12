import User from '../models/userModel';
import { Request, Response } from 'express';
import * as messageService from "../services/messageService"

export const sendMsg = async (req: Request, res: Response) => {
    try {
        const fromUser = req.username;
        if (!fromUser) return res.status(401).send({ error: "Unauthorized" });

        const { toUser, content, isGroup = false, groupId } = req.body;

        // Validation
        if (!content || content.trim() === "")
            return res.status(400).send({ error: "content is required" });
        if (isGroup && !groupId)
            return res.status(400).send({ error: "groupId required" });
        if (!isGroup && !toUser)
            return res.status(400).send({ error: "toUser required" });

        const newMsg = await messageService.sendMessage({ fromUser, toUser, content, isGroup, groupId });

        res.status(200).json(newMsg);
    } catch (error) {
        console.error(error);
        res.status(500).send("something went wrong");
    }
};

export const reactToMsg = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "Unauthorized" });

        const { emoji, messageId } = req.body;

        if (!emoji || !messageId)
            return res.status(400).send({ error: "messageId and emoji is required" });

        const result = await messageService.reactToMsg(username,messageId, emoji);

        if (result.status != "success") return res.status(Number(result.code)).send(result);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("something went wrong");
    }
};

export const updateMsgById = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "unauthorized" })

        const { messageId, udpatedContent } = req.body;

        if (!messageId || !udpatedContent) return res.status(400).send({ error: "messsgeId and updatedContent is required to edit/update any message" })
        const result = await messageService.updateMsgById(username, messageId, udpatedContent);

        return res.status(Number(result.code)).json(result)
    } catch (error: any) {
        res.status(500).send({ error: error.message || "Something went wrong" });
    }
}

export const deletedMsgById = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "unauthorized" })

        const { messageId } = req.params;

        if (!messageId) return res.status(400).send({ error: "messsgeId is required to delete any message" })
        const result = await messageService.deletedMsgById(username, messageId);

        return res.status(Number(result.code)).json(result)
    } catch (error: any) {
        res.status(500).send({ error: error.message || "Something went wrong" });
    }
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "Unauthorized" });

        const { toUser, groupId, isGroup } = req.body;
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 20;

        const result = await messageService.getMessagesService({ username, toUser, groupId, isGroup, page, limit });
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message || "Failed to fetch messages" });
    }
};

export const media = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "Unauthorized" });

        const { toUser } = req.body;
        if (!req.file || !toUser) return res.status(400).json({ error: "No file uploaded" });

        const result = await messageService.sendMediaService(username, toUser, req.file.path);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).send({ error: err.message || "Something went wrong" });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "Unauthorized" });

        const { name, photoURL, users } = req.body;

        const dbUser = await User.findOne({ username });
        if (!dbUser) return res.status(400).json({ error: "User not found" });

        const newGroup = await messageService.createGroupService({ name, photoURL, users, adminId: dbUser._id.toString() });
        res.status(200).json({ newGroup });
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};

export const getMembersByGroupId = async (req: Request, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).send({ error: "Unauthorized" });

        const { groupId } = req.params;
        if (!groupId) return res.status(400).json({ error: "groupId missing" });

        const members = await messageService.getMembersByGroupIdService(username, groupId);
        res.status(200).json(members);
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};
