import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos, auctionBids, purchases, notifications } from "@/lib/db/schema";
import { eq, and, lt, desc, isNotNull } from "drizzle-orm";

/**
 * Cron endpoint to close expired auctions.
 * 
 * For each expired auction:
 * 1. Find the highest bid
 * 2. Create a purchase record for the winner
 * 3. Notify the winner and the seller
 * 4. Mark the auction as closed (forAuction = false)
 * 
 * If no bids were placed, just close the auction and notify the seller.
 * 
 * Schedule: every 15 minutes via Vercel Cron or external service
 * Auth: Bearer token via CRON_SECRET env var
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all expired auctions that haven't been closed yet
  const expiredAuctions = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.forAuction, true),
        eq(photos.isPublished, true),
        isNotNull(photos.auctionEndDate),
        lt(photos.auctionEndDate, now)
      )
    );

  const results: { photoId: string; title: string; winner: string | null; amount: number | null }[] = [];

  for (const photo of expiredAuctions) {
    try {
      // Get the highest bid for this photo
      const [topBid] = await db
        .select()
        .from(auctionBids)
        .where(eq(auctionBids.photoId, photo.id))
        .orderBy(desc(auctionBids.amount))
        .limit(1);

      if (topBid) {
        // Winner found — create purchase record
        const platformFee = Math.round(topBid.amount * 0.15 * 100) / 100;
        const sellerEarnings = Math.round(topBid.amount * 0.85 * 100) / 100;

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

        // Notify the winner
        await db.insert(notifications).values({
          userId: topBid.userId,
          actorId: photo.userId,
          type: "auction_won",
          message: `You won the auction for "${photo.title}" with a bid of $${topBid.amount.toFixed(2)}!`,
          photoId: photo.id,
        });

        // Notify the seller
        await db.insert(notifications).values({
          userId: photo.userId,
          actorId: topBid.userId,
          type: "purchase",
          message: `Your auction for "${photo.title}" has ended. Winning bid: $${topBid.amount.toFixed(2)}`,
          photoId: photo.id,
        });

        // Notify all other bidders that they lost
        const allBids = await db
          .select({ userId: auctionBids.userId })
          .from(auctionBids)
          .where(eq(auctionBids.photoId, photo.id));

        const notifiedUsers = new Set<string>();
        for (const bid of allBids) {
          if (bid.userId !== topBid.userId && !notifiedUsers.has(bid.userId)) {
            notifiedUsers.add(bid.userId);
            await db.insert(notifications).values({
              userId: bid.userId,
              actorId: photo.userId,
              type: "auction_bid",
              message: `The auction for "${photo.title}" has ended. You were outbid.`,
              photoId: photo.id,
            });
          }
        }

        results.push({
          photoId: photo.id,
          title: photo.title,
          winner: topBid.userId,
          amount: topBid.amount,
        });
      } else {
        // No bids — notify seller
        await db.insert(notifications).values({
          userId: photo.userId,
          type: "system",
          message: `Your auction for "${photo.title}" has ended with no bids.`,
          photoId: photo.id,
        });

        results.push({
          photoId: photo.id,
          title: photo.title,
          winner: null,
          amount: null,
        });
      }

      // Close the auction
      await db
        .update(photos)
        .set({
          forAuction: false,
          updatedAt: now,
        })
        .where(eq(photos.id, photo.id));

    } catch (err) {
      console.error(`Failed to process auction for photo ${photo.id}:`, err);
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
