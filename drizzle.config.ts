import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Use DIRECT_URL (no pooler) for migrations/push — PgBouncer breaks DDL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
