import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Please enter a valid email." })
      .max(64)
      .trim(),
    password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .max(32, { message: "Password must be less than 32 characters" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    passwordConfirm: z.string({ required_error: "Confirm password" }).trim(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords don't match",
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Please enter your email").max(64),
  password: z
    .string()
    .min(1, { message: "Please enter your password" })
    .max(32),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const resetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(64),
});

export type ResetRequestSchema = z.infer<typeof resetRequestSchema>;

// export const resetPasswordSchema = z
//   .object({
//     password: z.string().min(8, "Password must be at least 8 characters"),
//     confirmPassword: z
//       .string()
//       .min(8, "Password must be at least 8 characters"),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

// export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// Reset password schema with code
export const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address").optional(),
    code: z.string().length(6, "Reset code must be 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const verificationCodeSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(64),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export type VerificationCodeSchema = z.infer<typeof verificationCodeSchema>;
