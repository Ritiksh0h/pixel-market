"use server";

import { db } from "@/lib/db";
import {
  photos,
  purchases,
  licenses,
  notifications,
  auctionBids,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, sql } from "drizzle-orm";
import Stripe from "stripe";
import { calculateFees } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

// ── Create checkout session ──
export async function createCheckoutAction(
  photoId: string,
  licenseId: string,
  type: "buy" | "rent"
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const [photo] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, photoId))
    .limit(1);

  if (!photo) return { error: "Photo not found" };
  if (photo.userId === session.user.id)
    return { error: "Cannot purchase your own photo" };

  // Get license details
  const [license] = await db
    .select()
    .from(licenses)
    .where(and(eq(licenses.id, licenseId), eq(licenses.photoId, photoId)))
    .limit(1);

  if (!license) return { error: "License not found" };

  const price = type === "rent" && photo.rentPriceMonthly
    ? photo.rentPriceMonthly
    : license.price;

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${photo.title} — ${license.name}`,
              description: license.description,
              images: photo.thumbnailUrl ? [photo.thumbnailUrl] : [],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${photoId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/photos/${photo.slug}`,
      metadata: {
        photoId,
        buyerId: session.user.id,
        sellerId: photo.userId,
        licenseId,
        type,
        price: price.toString(),
      },
    });

    return { url: stripeSession.url };
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return { error: "Failed to create checkout session" };
  }
}

// ── Fulfill purchase (called from webhook) ──
export async function fulfillPurchase(stripeSessionId: string) {
  const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);

  if (stripeSession.payment_status !== "paid") return;

  const { photoId, buyerId, sellerId, licenseId, type, price } =
    stripeSession.metadata!;

  // Check for duplicate
  const [existing] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripePaymentId, stripeSessionId))
    .limit(1);

  if (existing) return;

  const priceNum = parseFloat(price);
  const { platformFee, sellerEarnings } = calculateFees(priceNum);

  // Create purchase record
  await db.insert(purchases).values({
    photoId,
    buyerId,
    sellerId,
    licenseId: licenseId || null,
    type: type as "buy" | "rent",
    price: priceNum,
    platformFee,
    sellerEarnings,
    status: "completed",
    stripePaymentId: stripeSessionId,
    rentStartDate: type === "rent" ? new Date() : null,
    rentEndDate:
      type === "rent"
        ? new Date(Date.now() + 30 * 86400000) // 30 days
        : null,
  });

  // Increment download count
  await db
    .update(photos)
    .set({ downloadCount: sql`${photos.downloadCount} + 1` })
    .where(eq(photos.id, photoId));

  // Notify seller
  await db.insert(notifications).values({
    userId: sellerId,
    actorId: buyerId,
    type: "purchase",
    message: `Someone purchased your photo!`,
    photoId,
  });
}

// ── Place auction bid ──
export async function placeBidAction(photoId: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const [photo] = await db
    .select()
    .from(photos)
    .where(
      and(eq(photos.id, photoId), eq(photos.forAuction, true))
    )
    .limit(1);

  if (!photo) return { error: "Photo not found or not up for auction" };
  if (photo.userId === session.user.id) return { error: "Cannot bid on your own photo" };
  if (photo.auctionEndDate && photo.auctionEndDate < new Date())
    return { error: "Auction has ended" };

  // Get current highest bid
  const [highestBid] = await db
    .select()
    .from(auctionBids)
    .where(eq(auctionBids.photoId, photoId))
    .orderBy(desc(auctionBids.amount))
    .limit(1);

  const minimumBid = highestBid
    ? highestBid.amount + 1
    : photo.auctionStartBid || 1;

  if (amount < minimumBid) {
    return { error: `Minimum bid is $${minimumBid.toFixed(2)}` };
  }

  await db.insert(auctionBids).values({
    photoId,
    userId: session.user.id,
    amount,
  });

  // Notify seller
  await db.insert(notifications).values({
    userId: photo.userId,
    actorId: session.user.id,
    type: "auction_bid",
    message: `New bid of $${amount.toFixed(2)} on your photo`,
    photoId,
  });

  // Notify previous highest bidder they've been outbid
  if (highestBid && highestBid.userId !== session.user.id) {
    await db.insert(notifications).values({
      userId: highestBid.userId,
      actorId: session.user.id,
      type: "auction_bid",
      message: `You've been outbid on a photo`,
      photoId,
    });
  }

  revalidatePath(`/photos`);
  return { success: true };
}
