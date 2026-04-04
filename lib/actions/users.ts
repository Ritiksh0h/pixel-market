"use server";

import { db } from "@/lib/db";
import { users, follows, photos, notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, sql, count, ilike } from "drizzle-orm";
import { uploadFile, BUCKETS } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ── Toggle follow ──
export async function toggleFollowAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  if (session.user.id === targetUserId) return { error: "Cannot follow yourself" };

  const [existing] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, targetUserId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, targetUserId)
        )
      );
    revalidatePath("/photographers");
    return { following: false };
  } else {
    await db.insert(follows).values({
      followerId: session.user.id,
      followingId: targetUserId,
    });

    await db.insert(notifications).values({
      userId: targetUserId,
      actorId: session.user.id,
      type: "follow",
      message: `${session.user.name || "Someone"} started following you`,
    });

    revalidatePath("/photographers");
    return { following: true };
  }
}

// ── Get user profile ──
export async function getUserProfile(username: string) {
  const session = await auth();

  // Case-insensitive username lookup
  const [user] = await db
    .select()
    .from(users)
    .where(ilike(users.username, username))
    .limit(1);

  if (!user) return null;

  // Get follower/following counts
  const [{ followerCount }] = await db
    .select({ followerCount: count() })
    .from(follows)
    .where(eq(follows.followingId, user.id));

  const [{ followingCount }] = await db
    .select({ followingCount: count() })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  // Get photo count
  const [{ photoCount }] = await db
    .select({ photoCount: count() })
    .from(photos)
    .where(and(eq(photos.userId, user.id), eq(photos.isPublished, true)));

  // Check if current user follows this person
  let isFollowing = false;
  if (session?.user?.id && session.user.id !== user.id) {
    const [f] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, user.id)
        )
      )
      .limit(1);
    isFollowing = !!f;
  }

  // Get user's photos
  const userPhotos = await db.query.photos.findMany({
    where: and(eq(photos.userId, user.id), eq(photos.isPublished, true)),
    orderBy: desc(photos.createdAt),
    limit: 30,
  });

  // Remove sensitive fields
  const { password, stripeCustomerId, stripeConnectId, ...safeUser } = user;

  return {
    ...safeUser,
    followerCount,
    followingCount,
    photoCount,
    isFollowing,
    isOwnProfile: session?.user?.id === user.id,
    photos: userPhotos,
  };
}

// ── Update profile ──
export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const location = formData.get("location") as string;
  const website = formData.get("website") as string;
  const twitterHandle = formData.get("twitterHandle") as string;
  const instagramHandle = formData.get("instagramHandle") as string;

  // Validate username uniqueness
  if (username) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, username)))
      .limit(1);
    if (existing && existing.id !== session.user.id) {
      return { error: "Username is already taken" };
    }
  }

  // Handle avatar upload
  const avatarFile = formData.get("avatar") as File;
  let imageUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const ext = avatarFile.name.split(".").pop() || "jpg";
    imageUrl = await uploadFile(
      BUCKETS.AVATARS,
      `${session.user.id}/avatar.${ext}`,
      buffer,
      avatarFile.type
    );
  }

  // Handle cover image upload
  const coverFile = formData.get("coverImage") as File;
  let coverUrl: string | undefined;
  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const ext = coverFile.name.split(".").pop() || "jpg";
    coverUrl = await uploadFile(
      BUCKETS.COVERS,
      `${session.user.id}/cover.${ext}`,
      buffer,
      coverFile.type
    );
  }

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (name) updateData.name = name;
  if (username) updateData.username = username.toLowerCase();
  if (bio !== null) updateData.bio = bio;
  if (location !== null) updateData.location = location;
  if (website !== null) updateData.website = website;
  if (twitterHandle !== null) updateData.twitterHandle = twitterHandle;
  if (instagramHandle !== null) updateData.instagramHandle = instagramHandle;
  if (imageUrl) updateData.image = imageUrl;
  if (coverUrl) updateData.coverImage = coverUrl;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  revalidatePath(`/photographers/${username || session.user.username}`);
  return { success: true };
}

// ── Get notifications ──
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id),
    with: {
      actor: { columns: { id: true, name: true, username: true, image: true } },
    },
    orderBy: desc(notifications.createdAt),
    limit: 30,
  });
}

// ── Mark notifications read ──
export async function markNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      )
    );

  revalidatePath("/dashboard");
}
