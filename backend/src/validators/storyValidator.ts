import { z } from "zod";
import mongoose from "mongoose";

// ponytail: reject malformed ids here so findById never throws CastError 500s (issue #16)
const objectId = z.string().refine((id) => mongoose.isValidObjectId(id), {
  message: "Invalid id",
});

export const createStorySchema = z.object({
  caption: z.string().max(300).optional(),

  publicId: z.string(),

  url: z.string().url(),

  resourceType: z.enum(["image", "video"]),

  format: z.string().optional(),

  width: z.number().optional(),

  height: z.number().optional(),

  duration: z.number().optional(),
});

export const userStoriesSchema = z.object({
  userId: objectId,
});

export const storyIdSchema = z.object({
  storyId: objectId,
});
