"use server";

import { db } from "@/lib/db";
import {
  photos,
  tags,
  photoTags,
  likes,
  comments,
  licenses,
  notifications,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, ilike, or, sql, count } from "drizzle-orm";
import { uploadFile, BUCKETS, deleteFile } from "@/lib/supabase";
import { slugify, calculateFees } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// ── Upload photo ──
export async function uploadPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const rl = rateLimit(session.user.id, "upload");
  if (rl) return rl;

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // Validate file type and size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(`.${ext}`)) {
    return { error: "Only JPG, PNG, WebP, and HEIC files are allowed" };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { error: "File size must be under 50MB" };
  }

  const title = (formData.get("title") as string) || "Untitled";
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const tagNames = (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [];
  const locationTaken = formData.get("locationTaken") as string;
  const hideLocation = formData.get("hideLocation") === "true";

  // Monetization
  const forSale = formData.get("forSale") === "true";
  const salePrice = forSale ? parseFloat(formData.get("salePrice") as string) : null;
  const forRent = formData.get("forRent") === "true";
  const rentPriceMonthly = forRent ? parseFloat(formData.get("rentPrice") as string) : null;
  const forAuction = formData.get("forAuction") === "true";
  const auctionStartBid = forAuction ? parseFloat(formData.get("auctionStartBid") as string) : null;
  const auctionDays = forAuction ? parseInt(formData.get("auctionDays") as string) || 7 : null;
  const auctionEndDate = auctionDays ? new Date(Date.now() + auctionDays * 86400000) : null;

  try {
    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Sharp pipeline: thumbnail, watermark, EXIF, dimensions ──
    const { processImage } = await import("@/lib/image-processing");
    const processed = await processImage(buffer);

    // Generate unique paths
    const fileSlug = slugify(title) + "-" + Date.now();
    const storagePath = `${session.user.id}/${fileSlug}.jpg`;
    const thumbPath = `${session.user.id}/${fileSlug}-thumb.jpg`;
    const watermarkPath = `${session.user.id}/${fileSlug}-wm.jpg`;

    // Upload all three versions in parallel
    const [originalUrl, thumbnailUrl, watermarkedUrl] = await Promise.all([
      uploadFile(BUCKETS.PHOTOS, storagePath, buffer, file.type),
      uploadFile(BUCKETS.THUMBNAILS, thumbPath, processed.thumbnail, "image/jpeg"),
      uploadFile(BUCKETS.WATERMARKED, watermarkPath, processed.watermarked, "image/jpeg"),
    ]);

    // Insert photo record with real dimensions and EXIF
    const [photo] = await db
      .insert(photos)
      .values({
        title,
        description,
        slug: fileSlug,
        originalUrl,
        watermarkedUrl,
        thumbnailUrl,
        width: processed.width,
        height: processed.height,
        fileSize: file.size,
        mimeType: file.type,
        camera: processed.exif.camera,
        lens: processed.exif.lens,
        aperture: processed.exif.aperture,
        shutterSpeed: processed.exif.shutterSpeed,
        iso: processed.exif.iso,
        focalLength: processed.exif.focalLength,
        dateTaken: processed.exif.dateTaken,
        userId: session.user.id,
        categoryId: categoryId || null,
        locationTaken,
        hideLocation,
        forSale,
        salePrice,
        forRent,
        rentPriceMonthly,
        forAuction,
        auctionStartBid,
        auctionEndDate,
      })
      .returning();

    // Handle tags
    if (tagNames.length > 0) {
      for (const name of tagNames) {
        const slug = slugify(name);
        // Upsert tag
        const [tag] = await db
          .insert(tags)
          .values({ name: name.toLowerCase(), slug })
          .onConflictDoNothing({ target: tags.name })
          .returning();

        const tagId = tag?.id || (await db.select({ id: tags.id }).from(tags).where(eq(tags.name, name.toLowerCase())).limit(1))[0]?.id;

        if (tagId) {
          await db.insert(photoTags).values({ photoId: photo.id, tagId }).onConflictDoNothing();
        }
      }
    }

    // Add default licenses
    await db.insert(licenses).values([
      {
        name: "Personal License",
        description: "For personal, non-commercial use only",
        price: salePrice ? salePrice * 0.5 : 19.99,
        photoId: photo.id,
      },
      {
        name: "Commercial License",
        description: "For business and commercial use",
        price: salePrice || 49.99,
        photoId: photo.id,
      },
      {
        name: "Extended License",
        description: "Unlimited commercial use, including templates and resale",
        price: salePrice ? salePrice * 2 : 99.99,
        photoId: photo.id,
      },
    ]);

    revalidatePath("/dashboard");
    return { success: true, slug: photo.slug };
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Failed to upload photo. Please try again." };
  }
}

// ── Toggle like ──
export async function toggleLikeAction(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const rl = rateLimit(session.user.id, "like");
  if (rl) return rl;

  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, session.user.id), eq(likes.photoId, photoId)))
    .limit(1);

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.photoId, photoId)));
    await db
      .update(photos)
      .set({ likeCount: sql`${photos.likeCount} - 1` })
      .where(eq(photos.id, photoId));
    revalidatePath(`/photos`);
    return { liked: false };
  } else {
    await db.insert(likes).values({ userId: session.user.id, photoId });
    await db
      .update(photos)
      .set({ likeCount: sql`${photos.likeCount} + 1` })
      .where(eq(photos.id, photoId));

    // Notify photo owner
    const [photo] = await db
      .select({ userId: photos.userId })
      .from(photos)
      .where(eq(photos.id, photoId))
      .limit(1);
    if (photo && photo.userId !== session.user.id) {
      await db.insert(notifications).values({
        userId: photo.userId,
        actorId: session.user.id,
        type: "like",
        message: `${session.user.name || "Someone"} liked your photo`,
        photoId,
      });
    }

    revalidatePath(`/photos`);
    return { liked: true };
  }
}

// ── Add comment ──
export async function addCommentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  const rl = rateLimit(session.user.id, "comment");
  if (rl) return rl;

  const photoId = formData.get("photoId") as string;
  const text = (formData.get("text") as string)?.trim();
  const parentId = (formData.get("parentId") as string) || null;

  if (!text || text.length < 1) return { error: "Comment cannot be empty" };
  if (text.length > 1000) return { error: "Comment is too long" };

  const [comment] = await db
    .insert(comments)
    .values({
      text,
      userId: session.user.id,
      photoId,
      parentId,
    })
    .returning();

  // Notify photo owner
  const [photo] = await db
    .select({ userId: photos.userId })
    .from(photos)
    .where(eq(photos.id, photoId))
    .limit(1);
  if (photo && photo.userId !== session.user.id) {
    await db.insert(notifications).values({
      userId: photo.userId,
      actorId: session.user.id,
      type: "comment",
      message: `${session.user.name || "Someone"} commented on your photo`,
      photoId,
    });
  }

  revalidatePath(`/photos`);
  return { success: true, commentId: comment.id };
}

// ── Search photos ──
export async function searchPhotosAction(query: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const results = await db.query.photos.findMany({
    where: and(
      eq(photos.isPublished, true),
      or(
        ilike(photos.title, `%${query}%`),
        ilike(photos.description, `%${query}%`),
        ilike(photos.locationTaken, `%${query}%`)
      )
    ),
    with: {
      user: { columns: { id: true, name: true, username: true, image: true } },
      category: true,
    },
    orderBy: desc(photos.createdAt),
    limit,
    offset,
  });

  const [{ total }] = await db
    .select({ total: count() })
    .from(photos)
    .where(
      and(
        eq(photos.isPublished, true),
        or(
          ilike(photos.title, `%${query}%`),
          ilike(photos.description, `%${query}%`)
        )
      )
    );

  return { photos: results, total, page, totalPages: Math.ceil(total / limit) };
}

// ── Get feed photos (dashboard) ──
export async function getFeedPhotos(page = 1, limit = 20, category?: string) {
  const offset = (page - 1) * limit;

  const where = category
    ? and(eq(photos.isPublished, true), eq(photos.categoryId, category))
    : eq(photos.isPublished, true);

  const results = await db.query.photos.findMany({
    where,
    with: {
      user: { columns: { id: true, name: true, username: true, image: true } },
    },
    orderBy: desc(photos.createdAt),
    limit,
    offset,
  });

  return results;
}

// ── Get single photo by slug ──
export async function getPhotoBySlug(slug: string) {
  const session = await auth();

  const photo = await db.query.photos.findFirst({
    where: eq(photos.slug, slug),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          location: true,
        },
      },
      category: true,
      tags: { with: { tag: true } },
      licenses: true,
      comments: {
        with: {
          user: { columns: { id: true, name: true, username: true, image: true } },
        },
        orderBy: desc(comments.createdAt),
        limit: 50,
      },
    },
  });

  if (!photo) return null;

  // Increment view count
  await db
    .update(photos)
    .set({ viewCount: sql`${photos.viewCount} + 1` })
    .where(eq(photos.id, photo.id));

  // Check if current user liked this photo
  let isLiked = false;
  if (session?.user?.id) {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, session.user.id), eq(likes.photoId, photo.id)))
      .limit(1);
    isLiked = !!like;
  }

  return { ...photo, isLiked };
}

// ── Delete photo ──
export async function deletePhotoAction(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const [photo] = await db
    .select()
    .from(photos)
    .where(and(eq(photos.id, photoId), eq(photos.userId, session.user.id)))
    .limit(1);

  if (!photo) return { error: "Photo not found or not authorized" };

  // Delete all versions from storage
  try {
    const extractPath = (url: string) => url.split("/").slice(-2).join("/");
    await Promise.allSettled([
      deleteFile(BUCKETS.PHOTOS, extractPath(photo.originalUrl)),
      deleteFile(BUCKETS.THUMBNAILS, extractPath(photo.thumbnailUrl)),
      photo.watermarkedUrl
        ? deleteFile(BUCKETS.WATERMARKED, extractPath(photo.watermarkedUrl))
        : Promise.resolve(),
    ]);
  } catch (err) {
    console.error("Failed to delete files:", err);
  }

  await db.delete(photos).where(eq(photos.id, photoId));

  revalidatePath("/dashboard");
  return { success: true };
}
