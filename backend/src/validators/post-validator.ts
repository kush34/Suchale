import { z } from "zod";

export const createPostValidator = z.object({
  content: z.string().trim().max(5000).optional(),

  media: z.array(z.string().url()).default([]),

  mentions: z
    .array(
      z.object({
        id: z.string(),
      })
    )
    .default([]),

  hashtags: z.array(z.string()).default([]),
}).refine(
  (data) =>
    (data.content && data.content.trim().length > 0) ||
    data.media.length > 0,
  {
    message: "Post must have either content or media.",
  }
);

export type CreatePostDto = z.infer<typeof createPostValidator>;