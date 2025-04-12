import { z } from "zod";
import { sanitizedText } from "../utils";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(32)
    .transform((name) => sanitizedText(name)),
  about: z
    .string()
    .min(0)
    .max(2000)
    .transform((about) => sanitizedText(about)),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updateProfileImageSchema = z.object({
  imageUrl: z.string(),
  fileId: z.string(),
});

export type UpdateProfileImageSchema = z.infer<typeof updateProfileImageSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(32)
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/)
      .regex(/[^a-zA-Z0-9]/)
      .trim(),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
