import { z } from "zod";
import { sanitizedText } from "../utils";

export const commentSchema = z.object({
  text: z
    .string()
    .trim()
    // .min(1, { message: "Content is required" })
    .min(1)
    // .max(500, { message: "Comment is too long (max 500 characters)" })
    .max(500)
    .transform((text) => sanitizedText(text)),
});

export type CommentSchema = z.infer<typeof commentSchema>;
