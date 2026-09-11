import { z } from "zod";

export const createPostValidator = z.object({
  content: z.string().trim().max(5000).optional(),

  // ponytail: posts upload through our signed Cloudinary flow (issue #16) —
  // plain any-host urls would reintroduce hotlinking
  media: z
    .array(
      z.string().url().refine((url) => url.startsWith("https://res.cloudinary.com/"), {
        message: "Media must be a Cloudinary URL",
      })
    )
    .default([]),

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