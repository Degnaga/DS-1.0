"use server";

import { createHash, randomInt } from "crypto";
import { signIn, signOut } from "@/auth";
import { compare, hash } from "bcryptjs";
import {
  signUpSchema,
  SignUpSchema,
  SignInSchema,
  ResetRequestSchema,
  ResetPasswordSchema,
  resetPasswordSchema,
} from "../validation";
import { pool } from "../db/db";
import { sendEmail } from "../email";
import { getUserId } from "./userActions";
import { ensureUniqueProfileSlug, generateSlug } from "../utils";

// Resend verification code
export async function resendVerificationCode(email: string) {
  try {
    // Check if user exists and is not verified
    const userResult = await pool.query(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return {
        status: "success",
        message:
          "If your email is registered, you will receive a verification code",
      };
    }

    const user = userResult.rows[0];

    // If already verified, return success but with a different message
    if (user.emailVerified) {
      return { status: "success", message: "Your email is already verified" };
    }

    // Generate new verification code
    const result = await generateVerificationCode(user.id, email);

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    // Send verification email with code
    await sendVerificationEmail(email, result.code);

    return { status: "success", message: "Verification code sent" };
  } catch (error) {
    console.error("Resend verification code error:", error);
    return { status: "error", error: "Failed to send verification code" };
  }
}

export async function generateVerificationCode(userId: string, email: string) {
  // Check rate limiting
  const rateLimitResult = await pool.query(
    "SELECT created_at FROM verification_token WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1",
    [email]
  );

  if (rateLimitResult.rows.length > 0) {
    const lastCodeTime = new Date(rateLimitResult.rows[0].created_at);
    const timeDiff = Date.now() - lastCodeTime.getTime();

    // Rate limit: 1 code per 5 minutes (300000 ms)
    if (timeDiff < 300000) {
      const timeLeft = Math.ceil((300000 - timeDiff) / 1000 / 60);
      return {
        status: "error",
        message: `Please wait ${timeLeft} minute${
          timeLeft !== 1 ? "s" : ""
        } before requesting a new code`,
      };
    }
  }

  // Generate a 6-digit code
  const code = randomInt(100000, 999999).toString();
  const hashedCode = createHash("sha256").update(code).digest("hex");

  // Set expiry (1 hour from now)
  const expires = new Date(Date.now() + 3600000);
  const created_at = new Date();

  // Delete any existing codes for this email
  await pool.query("DELETE FROM verification_token WHERE identifier = $1", [
    email,
  ]);

  // Store code in database with user_id reference
  await pool.query(
    "INSERT INTO verification_token (identifier, token, expires, user_id, created_at) VALUES ($1, $2, $3, $4, $5)",
    [email, hashedCode, expires, userId, created_at]
  );

  return { status: "success", code };
}

// Generate password reset code
export async function generatePasswordResetCode(userId: string, email: string) {
  // Check rate limiting
  const rateLimitResult = await pool.query(
    "SELECT created_at FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

  if (rateLimitResult.rows.length > 0) {
    const lastCodeTime = new Date(rateLimitResult.rows[0].created_at);
    const timeDiff = Date.now() - lastCodeTime.getTime();

    // Rate limit: 1 code per 5 minutes (300000 ms)
    if (timeDiff < 300000) {
      const timeLeft = Math.ceil((300000 - timeDiff) / 1000 / 60);
      return {
        status: "error",
        error: `Please wait ${timeLeft} minute${
          timeLeft !== 1 ? "s" : ""
        } before requesting a new code`,
      };
    }
  }

  // Generate a 6-digit code
  const code = randomInt(100000, 999999).toString();
  const hashedCode = createHash("sha256").update(code).digest("hex");

  // Set expiry (1 hour from now)
  const expires = new Date(Date.now() + 3600000);
  const created_at = new Date();

  // Delete any existing codes for this user
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
    userId,
  ]);

  // Store code in database
  await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token, expires, email, created_at) VALUES ($1, $2, $3, $4, $5)",
    [userId, hashedCode, expires, email, created_at]
  );

  return { status: "success", code };
}

export async function sendVerificationEmail(
  email: string,
  code: string | undefined
) {
  return await sendEmail({
    to: email,
    subject: "Your Email Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Verify your email address</h1>
        <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">${code}</div>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export const verifyEmailWithCode = async (token: string, email: string) => {
  try {
    // Hash the code
    const hashedCode = createHash("sha256").update(token).digest("hex");

    // Find the code in the database
    const codeResult = await pool.query(
      "SELECT user_id, expires FROM verification_token WHERE identifier = $1 AND token = $2",
      [email, hashedCode]
    );

    if (codeResult.rows.length === 0) {
      return { status: "error", error: "Invalid verification code" };
    }

    const { user_id, expires } = codeResult.rows[0];

    // Check if code is expired
    if (new Date(expires) < new Date()) {
      // Delete expired code
      await pool.query(
        "DELETE FROM verification_token WHERE identifier = $1 AND token = $2",
        [email, hashedCode]
      );
      return { status: "error", error: "Verification code has expired" };
    }

    // Update user's emailVerified field
    await pool.query(
      "UPDATE users SET email_verified = NOW() WHERE id = $1 AND email = $2",
      [user_id, email]
    );

    // Delete the used code
    await pool.query(
      "DELETE FROM verification_token WHERE identifier = $1 AND token = $2",
      [email, hashedCode]
    );

    return { status: "success", message: "Email verified successfully" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { status: "error", error: "Failed to verify email" };
  }
};

// Reset password with code
export async function resetPasswordWithCode(data: ResetPasswordSchema) {
  try {
    const { email, code, password } = data;

    // Hash the code
    const hashedCode = createHash("sha256").update(code).digest("hex");

    // Find the code in the database
    const codeResult = await pool.query(
      "SELECT user_id, expires FROM password_reset_tokens WHERE email = $1 AND token = $2",
      [email, hashedCode]
    );

    if (codeResult.rows.length === 0) {
      return { status: "error", error: "Invalid reset code" };
    }

    const { user_id, expires } = codeResult.rows[0];

    // Check if code is expired
    if (new Date(expires) < new Date()) {
      // Delete expired code
      await pool.query(
        "DELETE FROM password_reset_tokens WHERE email = $1 AND token = $2",
        [email, hashedCode]
      );
      return { status: "error", error: "Reset code has expired" };
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update user's password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      user_id,
    ]);

    // Delete the used code
    await pool.query(
      "DELETE FROM password_reset_tokens WHERE email = $1 AND token = $2",
      [email, hashedCode]
    );

    return { status: "success", message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset password error:", error);
    return { status: "error", error: "Failed to reset password" };
  }
}

export async function requestPasswordReset(data: ResetRequestSchema) {
  try {
    const { email } = data;

    // Check if user exists
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return {
        status: "success",
        message:
          "If your email is registered, you will receive a password reset code",
      };
    }

    const userId = userResult.rows[0].id;

    // Generate reset code
    const result = await generatePasswordResetCode(userId, email);

    if (result.status === "error") {
      return { status: "error", message: result.error };
    }

    // Send reset email with code
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Reset your password</h1>
          <p>You are receiving this email because you requested a password reset for your account.</p>
          <p>Please use the following code to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">${result.code}</div>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This code will expire in 1 hour.</p>
        </div>
      `,
    });

    return {
      status: "success",
      message:
        "If your email is registered, you will receive a password reset code",
    };
  } catch (error) {
    console.error("Request password reset error:", error);
    return { status: "error", error: "Failed to request password reset" };
  }
}

// Request password reset
export async function requestPasswordResetLink(data: ResetRequestSchema) {
  try {
    const { email } = data;

    // Check if user exists
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return {
        status: "success",
        message:
          "If your email is registered, you will receive a password reset link",
      };
    }

    const userId = userResult.rows[0].id;

    // Generate reset token
    const token = randomInt(100000, 999999).toString();
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Set expiry (1 hour from now)
    const expires = new Date(Date.now() + 3600000);

    // Delete any existing tokens for this user
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
      userId,
    ]);

    // Store token in database
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires) VALUES ($1, $2, $3)",
      [userId, hashedToken, expires]
    );

    // Send reset email with code
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Reset your password</h1>
          <p>You are receiving this email because you requested a password reset for your account.</p>
          <p>Please use the following code to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">${token}</div>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This code will expire in 1 hour.</p>
        </div>
      `,
    });

    return {
      status: "success",
      message:
        "If your email is registered, you will receive a password reset code",
    };
  } catch (error) {
    console.error("Request password reset error:", error);
    return { status: "error", error: "Failed to request password reset" };
  }
}

export async function checkUserCredentials(email: string, password: string) {
  const query =
    "SELECT id, email, password, email_verified FROM users WHERE email = $1";
  const values = [email];
  const result = await pool.query(query, values);

  if (!result.rows.length) {
    return null;
  }
  const user = result.rows[0];

  const isValid = await compare(password, user.password);
  if (!isValid) return null;

  return { id: user.id, email: user.email, emailVerified: user.email_verified };
}

export const signInUser = async (data: SignInSchema) => {
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [data.email]);

    const user = result.rows[0];

    if (
      !user ||
      !user.password ||
      !(await compare(data.password, user.password))
    ) {
      return { status: "error", error: "Invalid credentials" };
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { status: "success", data: "Logged in" };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "Something went wrong" };
  }
};
export async function signUpUser(data: SignUpSchema) {
  try {
    const validated = signUpSchema.safeParse(data);
    if (!validated.success) {
      return { status: "error", error: validated.error.errors };
    }

    const { email, password } = validated.data;
    const profileName = email.split("@")[0];

    // Generate a base slug from the profile name
    const baseSlug = generateSlug(profileName);

    const checkQuery = "SELECT id FROM users WHERE email = $1";
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      return { status: "error", error: "Email is already in use!" };
    }

    const hashedPassword = await hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userQuery = `
          INSERT INTO users (id, email, password) 
          VALUES (gen_random_uuid(), $1, $2) 
          RETURNING id, email;
        `;
      const userResult = await client.query(userQuery, [email, hashedPassword]);
      if (!userResult.rows[0]) {
        throw new Error("User insertion failed");
      }

      const userId = userResult.rows[0].id;

      // Ensure the slug is unique
      const uniqueSlug = await ensureUniqueProfileSlug(pool, baseSlug);

      const profileQuery = `
          INSERT INTO profiles (user_id, name, slug) 
          VALUES ($1, $2, $3) 
          RETURNING *;
        `;
      const profileResult = await client.query(profileQuery, [
        userId,
        profileName,
        uniqueSlug,
      ]);

      if (!profileResult.rows[0]) {
        throw new Error("Profile insertion failed");
      }

      await client.query("COMMIT");

      // Generate verification code
      const codeResult = await generateVerificationCode(userId, email);

      if (codeResult.status === "error") {
        throw new Error("Code generation failed");
      }

      // Send verification email with code
      await sendVerificationEmail(email, codeResult.code);

      return { status: "success", data: userResult.rows[0] };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      return { status: "error", error: "Database transaction failed" };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Sign-up error:", error);
    return { status: "error", error: "Something went wrong" };
  }
}

// export const signUpUser = async (data: SignUpSchema) => {
//   try {
//     const validated = signUpSchema.safeParse(data);
//     if (!validated.success) {
//       return { status: "error", error: validated.error.errors };
//     }

//     const { email, password } = validated.data;
//     const profileName = email.split("@")[0];

//     const checkQuery = "SELECT id FROM users WHERE email = $1";
//     const checkResult = await pool.query(checkQuery, [email]);

//     if (checkResult.rows.length > 0) {
//       return { status: "error", error: "Email is already in use!" };
//     }

//     const hashedPassword = await hash(password, 10);

//     const client = await pool.connect();
//     try {
//       await client.query("BEGIN");

//       const userQuery = `
//           INSERT INTO users (id, email, password)
//           VALUES (gen_random_uuid(), $1, $2)
//           RETURNING id, email;
//         `;
//       const userResult = await client.query(userQuery, [email, hashedPassword]);
//       if (!userResult.rows[0]) {
//         throw new Error("User insertion failed");
//       }

//       const userId = userResult.rows[0].id;

//       const profileQuery = `
//           INSERT INTO profiles (user_id, name)
//           VALUES ($1, $2)
//           RETURNING *;
//         `;
//       const profileResult = await client.query(profileQuery, [
//         userId,
//         profileName,
//       ]);

//       if (!profileResult.rows[0]) {
//         throw new Error("Profile insertion failed");
//       }

//       await client.query("COMMIT");

//       // Generate verification code
//       const codeResult = await generateVerificationCode(userId, email);

//       if (codeResult.status === "error") {
//         throw new Error("Code generation failed");
//       }

//       // Send verification email with code
//       await sendVerificationEmail(email, codeResult.code);

//       return { status: "success", data: userResult.rows[0] };
//     } catch (error) {
//       await client.query("ROLLBACK");
//       console.error("Transaction error:", error);
//       return { status: "error", error: "Database transaction failed" };
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error("Sign-up error:", error);
//     return { status: "error", error: "Something went wrong" };
//   }
// };

export const signOutUser = async () => {
  return await signOut({ redirectTo: "/" });
};

// Request password reset
// export async function requestPasswordReset(data: ResetRequestSchema) {
//   try {
//     const validatedData = resetRequestSchema.parse(data);

//     // Check if user exists
//     const userResult = await pool.query(
//       "SELECT id FROM users WHERE email = $1",
//       [validatedData.email]
//     );

//     if (userResult.rows.length === 0) {
//       // Don't reveal if email exists or not for security
//       return {
//         status: "success",
//         message:
//           "If your email is registered, you will receive a password reset link",
//       };
//     }

//     const userId = userResult.rows[0].id;

//     // Generate token
//     const token = randomBytes(32).toString("hex");
//     const hashedToken = createHash("sha256").update(token).digest("hex");

//     // Set expiry (1 hour from now)
//     const expires = new Date(Date.now() + 3600000);

//     // Delete any existing tokens for this user
//     await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
//       userId,
//     ]);

//     // Store token in database
//     await pool.query(
//       "INSERT INTO password_reset_tokens (user_id, token, expires) VALUES ($1, $2, $3)",
//       [userId, hashedToken, expires]
//     );

//     // Create reset URL
//     const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-password-reset?token=${token}`;

//     // Send email with reset link
//     const emailResult = await sendEmail({
//       to: validatedData.email,
//       subject: "Password Reset Request",
//       html: `
//         <p>You requested a password reset.</p>
//         <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     });

//     if (emailResult.error) {
//       console.error("Failed to send email:", emailResult.error);
//       // Continue with success response even if email fails
//       // This prevents user enumeration
//     }

//     return {
//       status: "success",
//       message:
//         "If your email is registered, you will receive a password reset link",
//     };
//   } catch (error) {
//     console.error("Password reset request error:", error);
//     return { status: "error", error: "Failed to process your request" };
//   }
// }

// Reset password with token
export async function comfirmPasswordReset(
  token: string,
  data: ResetPasswordSchema
) {
  try {
    const validatedData = resetPasswordSchema.parse(data);

    // Hash the token from the URL
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Find the token in the database
    const tokenResult = await pool.query(
      "SELECT user_id, expires FROM password_reset_tokens WHERE token = $1",
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return { status: "error", error: "Invalid or expired token" };
    }

    const { user_id, expires } = tokenResult.rows[0];

    // Check if token is expired
    if (new Date(expires) < new Date()) {
      // Delete expired token
      await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
        hashedToken,
      ]);
      return { status: "error", error: "Token has expired" };
    }

    // Hash the new password
    const hashedPassword = await hash(validatedData.password, 10);

    // Update user's password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      user_id,
    ]);

    // Delete the used token
    await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
      hashedToken,
    ]);

    return {
      status: "success",
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return { status: "error", error: "Failed to reset password" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return {
        status: "error",
        error: "You must be logged in to change your password",
      };
    }

    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { status: "error", error: "User not found" };
    }

    const storedPassword = userResult.rows[0].password;

    const isPasswordValid = await compare(currentPassword, storedPassword);

    if (!isPasswordValid) {
      return { status: "error", error: "Current password is incorrect" };
    }

    const hashedPassword = await hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    return { status: "success", message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { status: "error", error: "Failed to change password" };
  }
}
