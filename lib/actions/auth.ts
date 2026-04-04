"use server";

import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/utils/password";
import { signIn } from "@/lib/auth";
import { z } from "zod";
import { createTransport } from "nodemailer";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ── Email transport ──
function getTransport() {
  return createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

// ── Signup with credentials ──
export async function signupAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email, password } = result.data;

  // Check if user exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  // Hash and create
  const hashed = await hashPassword(password);
  const username =
    email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") +
    Math.floor(Math.random() * 1000);

  await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    password: hashed,
    username,
  });

  // Auto sign-in after signup
  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { success: true, message: "Account created. Please log in." };
  }
}

// ── Forgot password ──
export async function forgotPasswordAction(formData: FormData) {
  const raw = { email: formData.get("email") as string };
  const result = forgotSchema.safeParse(raw);
  if (!result.success) return { error: result.error.errors[0].message };

  const email = result.data.email.toLowerCase();

  // Always return success to prevent email enumeration
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    try {
      const transport = getTransport();
      await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Reset your PixelMarket password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #111;">Reset your password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send reset email:", err);
    }
  }

  return { success: true, message: "If an account exists with that email, we sent a reset link." };
}

// ── Reset password ──
export async function resetPasswordAction(formData: FormData) {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
  };

  const result = resetSchema.safeParse(raw);
  if (!result.success) return { error: result.error.errors[0].message };

  const { token, password } = result.data;

  // Find and validate token
  const [verification] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!verification || verification.expires < new Date()) {
    return { error: "Invalid or expired reset link. Please request a new one." };
  }

  // Update password
  const hashed = await hashPassword(password);
  await db
    .update(users)
    .set({ password: hashed, updatedAt: new Date() })
    .where(eq(users.email, verification.identifier));

  // Delete used token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return { success: true };
}
