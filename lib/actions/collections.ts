"use server";

import { db } from "@/lib/db";
import { collections, collectionPhotos, photos } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

// ── Create collection ──
export async function createCollectionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const rl = rateLimit(session.user.id, "collection");
  if (rl) return rl;

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.has("isPublic");

  if (!name || name.length < 1) return { error: "Name is required" };
  if (name.length > 100) return { error: "Name is too long" };

  const [collection] = await db
    .insert(collections)
    .values({
      name,
      description,
      isPublic,
      userId: session.user.id,
    })
    .returning();

  revalidatePath("/collections");
  return { success: true, id: collection.id };
}

// ── Update collection ──
export async function updateCollectionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const collectionId = formData.get("collectionId") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.has("isPublic");

  if (!name || name.length < 1) return { error: "Name is required" };

  // Verify ownership
  const [existing] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
    .limit(1);

  if (!existing) return { error: "Collection not found" };

  await db
    .update(collections)
    .set({ name, description, isPublic, updatedAt: new Date() })
    .where(eq(collections.id, collectionId));

  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionId}`);
  return { success: true };
}

// ── Delete collection ──
export async function deleteCollectionAction(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const [existing] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
    .limit(1);

  if (!existing) return { error: "Collection not found" };

  await db.delete(collections).where(eq(collections.id, collectionId));

  revalidatePath("/collections");
  return { success: true };
}

// ── Add photo to collection ──
export async function addToCollectionAction(collectionId: string, photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Verify ownership of collection
  const [collection] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
    .limit(1);

  if (!collection) return { error: "Collection not found" };

  // Check if already in collection
  const [existing] = await db
    .select()
    .from(collectionPhotos)
    .where(and(eq(collectionPhotos.collectionId, collectionId), eq(collectionPhotos.photoId, photoId)))
    .limit(1);

  if (existing) return { error: "Photo already in this collection" };

  await db.insert(collectionPhotos).values({ collectionId, photoId });

  // Update collection timestamp
  await db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, collectionId));

  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionId}`);
  return { success: true };
}

// ── Remove photo from collection ──
export async function removeFromCollectionAction(collectionId: string, photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Verify ownership
  const [collection] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
    .limit(1);

  if (!collection) return { error: "Collection not found" };

  await db
    .delete(collectionPhotos)
    .where(and(eq(collectionPhotos.collectionId, collectionId), eq(collectionPhotos.photoId, photoId)));

  revalidatePath(`/collections/${collectionId}`);
  return { success: true };
}

// ── Toggle photo in collection (add if missing, remove if present) ──
export async function togglePhotoInCollectionAction(collectionId: string, photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const [collection] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
    .limit(1);

  if (!collection) return { error: "Collection not found" };

  const [existing] = await db
    .select()
    .from(collectionPhotos)
    .where(and(eq(collectionPhotos.collectionId, collectionId), eq(collectionPhotos.photoId, photoId)))
    .limit(1);

  if (existing) {
    await db
      .delete(collectionPhotos)
      .where(and(eq(collectionPhotos.collectionId, collectionId), eq(collectionPhotos.photoId, photoId)));
    revalidatePath(`/collections/${collectionId}`);
    return { added: false };
  } else {
    await db.insert(collectionPhotos).values({ collectionId, photoId });
    await db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, collectionId));
    revalidatePath(`/collections/${collectionId}`);
    return { added: true };
  }
}

// ── Get user's collections (with photo count + whether a specific photo is in each) ──
export async function getUserCollections(photoId?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userCollections = await db.query.collections.findMany({
    where: eq(collections.userId, session.user.id),
    with: {
      photos: {
        with: { photo: { columns: { id: true, thumbnailUrl: true } } },
        limit: 4,
        orderBy: desc(collectionPhotos.addedAt),
      },
    },
    orderBy: desc(collections.updatedAt),
  });

  // Get actual photo counts (the photos relation is limited to 4 for thumbnails)
  const counts = await db
    .select({
      collectionId: collectionPhotos.collectionId,
      count: count(),
    })
    .from(collectionPhotos)
    .where(
      sql`${collectionPhotos.collectionId} IN (${
        userCollections.length > 0
          ? sql.join(userCollections.map((c) => sql`${c.id}`), sql`, `)
          : sql`NULL`
      })`
    )
    .groupBy(collectionPhotos.collectionId);

  const countMap = new Map(counts.map((c) => [c.collectionId, c.count]));

  // If photoId provided, check which collections contain it
  if (photoId) {
    const inCollections = await db
      .select({ collectionId: collectionPhotos.collectionId })
      .from(collectionPhotos)
      .where(eq(collectionPhotos.photoId, photoId));
    const inSet = new Set(inCollections.map((c) => c.collectionId));

    return userCollections.map((c) => ({
      ...c,
      photoCount: countMap.get(c.id) || 0,
      containsPhoto: inSet.has(c.id),
    }));
  }

  return userCollections.map((c) => ({
    ...c,
    photoCount: countMap.get(c.id) || 0,
    containsPhoto: false,
  }));
}

// ── Quick save (one-click bookmark from photo cards) ──
// Auto-creates a "Saved" collection if none exists, then toggles the photo
export async function quickSaveAction(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const rl = rateLimit(session.user.id, "collection");
  if (rl) return rl;

  // Find or create default "Saved" collection
  let [saved] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.userId, session.user.id), eq(collections.name, "Saved")))
    .limit(1);

  if (!saved) {
    const [created] = await db
      .insert(collections)
      .values({
        name: "Saved",
        description: "Quick-saved photos",
        isPublic: false,
        userId: session.user.id,
      })
      .returning({ id: collections.id });
    saved = created;
  }

  // Toggle photo in/out
  const [existing] = await db
    .select()
    .from(collectionPhotos)
    .where(and(eq(collectionPhotos.collectionId, saved.id), eq(collectionPhotos.photoId, photoId)))
    .limit(1);

  if (existing) {
    await db
      .delete(collectionPhotos)
      .where(and(eq(collectionPhotos.collectionId, saved.id), eq(collectionPhotos.photoId, photoId)));
    revalidatePath("/collections");
    return { saved: false };
  } else {
    await db.insert(collectionPhotos).values({ collectionId: saved.id, photoId });
    await db.update(collections).set({ updatedAt: new Date() }).where(eq(collections.id, saved.id));
    revalidatePath("/collections");
    return { saved: true };
  }
}

// ── Quick check if photo is saved in any collection ──
export async function isPhotoSavedAction(photoId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const result = await db
    .select({ id: collectionPhotos.collectionId })
    .from(collectionPhotos)
    .innerJoin(collections, eq(collections.id, collectionPhotos.collectionId))
    .where(
      and(
        eq(collectionPhotos.photoId, photoId),
        eq(collections.userId, session.user.id)
      )
    )
    .limit(1);

  return result.length > 0;
}
