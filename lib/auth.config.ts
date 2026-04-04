import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// This config is used by middleware (Edge runtime).
// It must NOT import nodemailer or any Node.js-only modules.
// The full config with Nodemailer provider is in auth.ts.

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify",
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
    // Credentials listed here so middleware recognizes the session,
    // but authorize logic lives in the full auth.ts
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: () => null, // placeholder — real logic in auth.ts
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.isPremium = (user as any).isPremium;
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
} satisfies NextAuthConfig;
