"use server";

import { db } from "@/lib/db";
import { users, photos, purchases, comments, likes, notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, count, sql, and, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ── Admin check ──
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(session.user.email.toLowerCase());
}

async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) throw new Error("Unauthorized");
}

// ── Dashboard stats ──
export async function getAdminStats() {
  await requireAdmin();

  const [[userCount], [photoCount], [purchaseCount], [revenueResult]] =
    await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(photos),
      db.select({ count: count() }).from(purchases),
      db
        .select({ total: sql<number>`COALESCE(SUM(${purchases.price}), 0)` })
        .from(purchases)
        .where(eq(purchases.status, "completed")),
    ]);

  // Recent signups (last 7 days)
  const recentUsers = await db
    .select({ count: count() })
    .from(users)
    .where(sql`${users.createdAt} > NOW() - INTERVAL '7 days'`);

  // Recent photos (last 7 days)
  const recentPhotos = await db
    .select({ count: count() })
    .from(photos)
    .where(sql`${photos.createdAt} > NOW() - INTERVAL '7 days'`);

  return {
    totalUsers: userCount.count,
    totalPhotos: photoCount.count,
    totalPurchases: purchaseCount.count,
    totalRevenue: Number(revenueResult.total) || 0,
    recentUsers: recentUsers[0].count,
    recentPhotos: recentPhotos[0].count,
  };
}

// ── List users ──
export async function getAdminUsers(page = 1, limit = 20, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * limit;

  const where = search
    ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.username, `%${search}%`)
      )
    : undefined;

  const [results, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        image: users.image,
        isPremium: users.isPremium,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return { users: results, total, page, totalPages: Math.ceil(total / limit) };
}

// ── Delete user (and all their data) ──
export async function adminDeleteUser(userId: string) {
  await requireAdmin();

  // Don't allow deleting yourself
  const session = await auth();
  if (session?.user?.id === userId) return { error: "Cannot delete yourself" };

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true };
}

// ── List photos ──
export async function getAdminPhotos(page = 1, limit = 20, search?: string, filter?: "published" | "archived" | "all") {
  await requireAdmin();
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(photos.title, `%${search}%`),
        ilike(photos.description, `%${search}%`)
      )
    );
  }
  if (filter === "published") conditions.push(eq(photos.isPublished, true));
  if (filter === "archived") conditions.push(eq(photos.isPublished, false));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [results, [{ total }]] = await Promise.all([
    db.query.photos.findMany({
      where,
      with: {
        user: { columns: { id: true, name: true, username: true, email: true } },
      },
      orderBy: desc(photos.createdAt),
      limit,
      offset,
    }),
    db.select({ total: count() }).from(photos).where(where),
  ]);

  return { photos: results, total, page, totalPages: Math.ceil(total / limit) };
}

// ── Admin delete photo ──
export async function adminDeletePhoto(photoId: string) {
  await requireAdmin();
  await db.delete(photos).where(eq(photos.id, photoId));
  revalidatePath("/admin/photos");
  return { success: true };
}

// ── Admin toggle photo publish ──
export async function adminTogglePhotoPublish(photoId: string) {
  await requireAdmin();

  const [photo] = await db
    .select({ isPublished: photos.isPublished })
    .from(photos)
    .where(eq(photos.id, photoId))
    .limit(1);

  if (!photo) return { error: "Photo not found" };

  await db
    .update(photos)
    .set({ isPublished: !photo.isPublished, updatedAt: new Date() })
    .where(eq(photos.id, photoId));

  revalidatePath("/admin/photos");
  return { success: true, isPublished: !photo.isPublished };
}
