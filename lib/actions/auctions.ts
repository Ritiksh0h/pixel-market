"use server";

import { db } from "@/lib/db";
import { photos, auctionBids, purchases, notifications } from "@/lib/db/schema";
import { eq, and, lt, desc, isNotNull } from "drizzle-orm";

/**
 * Close a single expired auction.
 * Called on-demand when someone views an expired auction photo,
 * and also by the daily cron sweep.
 */
export async function closeAuction(photoId: string): Promise<boolean> {
  // Verify the auction is actually expired
  const [photo] = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.id, photoId),
        eq(photos.forAuction, true)
      )
    )
    .limit(1);

  if (!photo || !photo.auctionEndDate) return false;
  if (new Date(photo.auctionEndDate) > new Date()) return false; // Not expired yet

  const now = new Date();

  try {
    // Get highest bid
    const [topBid] = await db
      .select()
      .from(auctionBids)
      .where(eq(auctionBids.photoId, photoId))
      .orderBy(desc(auctionBids.amount))
      .limit(1);

    if (topBid) {
      const platformFee = Math.round(topBid.amount * 0.15 * 100) / 100;
      const sellerEarnings = Math.round(topBid.amount * 0.85 * 100) / 100;

      // Create purchase record
      await db.insert(purchases).values({
        photoId: photo.id,
        buyerId: topBid.userId,
        sellerId: photo.userId,
        type: "auction",
        price: topBid.amount,
        platformFee,
        sellerEarnings,
        status: "completed",
      });

      // Notify winner
      await db.insert(notifications).values({
        userId: topBid.userId,
        actorId: photo.userId,
        type: "auction_won",
        message: `You won the auction for "${photo.title}" with a bid of $${topBid.amount.toFixed(2)}!`,
        photoId: photo.id,
      });

      // Notify seller
      await db.insert(notifications).values({
        userId: photo.userId,
        actorId: topBid.userId,
        type: "purchase",
        message: `Your auction for "${photo.title}" ended. Winning bid: $${topBid.amount.toFixed(2)}`,
        photoId: photo.id,
      });

      // Notify losing bidders
      const allBids = await db
        .select({ userId: auctionBids.userId })
        .from(auctionBids)
        .where(eq(auctionBids.photoId, photoId));

      const notified = new Set<string>();
      for (const bid of allBids) {
        if (bid.userId !== topBid.userId && !notified.has(bid.userId)) {
          notified.add(bid.userId);
          await db.insert(notifications).values({
            userId: bid.userId,
            actorId: photo.userId,
            type: "auction_bid",
            message: `The auction for "${photo.title}" has ended. You were outbid.`,
            photoId: photo.id,
          });
        }
      }
    } else {
      // No bids — notify seller
      await db.insert(notifications).values({
        userId: photo.userId,
        type: "system",
        message: `Your auction for "${photo.title}" ended with no bids.`,
        photoId: photo.id,
      });
    }

    // Close the auction
    await db
      .update(photos)
      .set({ forAuction: false, updatedAt: now })
      .where(eq(photos.id, photo.id));

    return true;
  } catch (err) {
    console.error(`Failed to close auction for photo ${photoId}:`, err);
    return false;
  }
}

/**
 * Sweep all expired auctions. Called by daily cron as a safety net.
 */
export async function closeExpiredAuctions() {
  const now = new Date();

  const expired = await db
    .select({ id: photos.id })
    .from(photos)
    .where(
      and(
        eq(photos.forAuction, true),
        eq(photos.isPublished, true),
        isNotNull(photos.auctionEndDate),
        lt(photos.auctionEndDate, now)
      )
    );

  let closed = 0;
  for (const photo of expired) {
    const ok = await closeAuction(photo.id);
    if (ok) closed++;
  }

  return { total: expired.length, closed };
}
