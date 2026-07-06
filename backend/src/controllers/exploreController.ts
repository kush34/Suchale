// controllers/explore.controller.ts

import { Request, Response } from "express";
import * as ExploreService from "../services/exploreService";

export const search = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "");

    const result = await ExploreService.search(q);

    return res.status(200).json({
      success: true,
      results: result,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const trending = async (_req: Request, res: Response) => {
  try {
    const data = await ExploreService.getTrending();

    return res.status(200).json({
      success: true,
      trending: data,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

export const suggestions = async (req: Request, res: Response) => {
  try {
    const username = req.username!;

    const users = await ExploreService.getSuggestions(username);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

