import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";
import { categories, tags } from "../lib/db/schema";

// Load .env manually — tsx doesn't auto-load it
try {
  const envPath = resolve(process.cwd(), ".env");
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {}

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Check your .env file.");
    process.exit(1);
  }
  console.log("Connecting to database...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("Seeding categories...");
  await db
    .insert(categories)
    .values([
      { name: "Nature", slug: "nature", description: "Landscapes, wildlife, and natural wonders" },
      { name: "Architecture", slug: "architecture", description: "Buildings, interiors, and structural design" },
      { name: "People", slug: "people", description: "Portraits, street photography, and human stories" },
      { name: "Travel", slug: "travel", description: "Destinations, cultures, and adventures" },
      { name: "Food", slug: "food", description: "Culinary art and food photography" },
      { name: "Abstract", slug: "abstract", description: "Patterns, textures, and artistic compositions" },
      { name: "Urban", slug: "urban", description: "City life, streets, and urban landscapes" },
      { name: "Animals", slug: "animals", description: "Wildlife and pet photography" },
      { name: "Technology", slug: "technology", description: "Gadgets, code, and digital life" },
      { name: "Macro", slug: "macro", description: "Close-up and micro photography" },
    ])
    .onConflictDoNothing();

  console.log("Seeding tags...");
  const tagNames = [
    "landscape", "portrait", "black-and-white", "minimal", "colorful",
    "vintage", "urban", "nature", "abstract", "macro", "wildlife",
    "sunset", "sunrise", "night", "golden-hour", "aerial", "underwater",
    "street", "documentary", "fine-art", "long-exposure", "hdr",
  ];
  await db
    .insert(tags)
    .values(tagNames.map((name) => ({ name, slug: name })))
    .onConflictDoNothing();

  console.log("Seed complete!");
  await client.end();
}

seed().catch(console.error);
