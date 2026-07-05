import { z } from "zod";

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
  userId: z.string().min(1),
});

export const storyIdSchema = z.object({
  storyId: z.string().min(1),
});
