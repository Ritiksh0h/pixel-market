import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch FULL profile from DB (session only has name/username/image)
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!profile) redirect("/login");

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm profile={{
        name: profile.name || "",
        username: profile.username || "",
        image: profile.image || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        twitterHandle: profile.twitterHandle || "",
        instagramHandle: profile.instagramHandle || "",
      }} />
    </div>
  );
}
