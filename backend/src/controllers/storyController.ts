import { Request, Response } from "express";
import {
  createStorySchema,
  storyIdSchema,
  userStoriesSchema,
} from "../validators/storyValidator";
import * as storyService from "../services/storyService";

export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const signature = storyService.generateStoryUploadSignature(userId);

    return res.status(200).json(signature);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const createStory = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const parsed = createStorySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    const story = await storyService.createStory({
      userId,
      body: parsed.data,
    });

    return res.status(201).json(story);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getFeedStories = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const stories = await storyService.getFeedStories(userId);

    return res.status(200).json(stories);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getUserStories = async (req: Request, res: Response) => {
  try {
    const parsed = userStoriesSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    const stories = await storyService.getUserStories(parsed.data.userId);

    return res.status(200).json(stories);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const markStoryViewed = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const parsed = storyIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    await storyService.markStoryViewed(parsed.data.storyId, userId);

    return res.status(200).json({
      success: true,
      message: "Story marked as viewed.",
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const getStoryViewers = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const parsed = storyIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    const viewers = await storyService.getStoryViewers(
      parsed.data.storyId,
      userId,
    );

    return res.status(200).json(viewers);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

export const deleteStory = async (req: Request, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const parsed = storyIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    await storyService.deleteStory(parsed.data.storyId, userId);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully.",
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
    });
  }
};
