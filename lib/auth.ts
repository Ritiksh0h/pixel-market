import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { authConfig } from "@/lib/auth.config";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string | null;
      isPremium: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    username?: string | null;
    isPremium?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      // Always fetch username from DB (OAuth providers return their own username, not ours)
      if (token.id && !token.username) {
        const [dbUser] = await db
          .select({ username: users.username, isPremium: users.isPremium })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (dbUser) {
          token.username = dbUser.username;
          token.isPremium = dbUser.isPremium;
        }
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.username = session.username;
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string | null;
        (session.user as any).isPremium = (token.isPremium as boolean) ?? false;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { magicLinkEmail } = await import("@/lib/email-templates");
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(provider.server as any);
        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: "Sign in to PixelMarket",
          html: magicLinkEmail(url),
        });
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          isPremium: user.isPremium,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.email && user.id) {
        const base = user.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const username = `${base}${Math.floor(Math.random() * 1000)}`;
        await db
          .update(users)
          .set({ username, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    },
  },
});
