import { NextRequest, NextResponse } from "next/server";
import { closeExpiredAuctions } from "@/lib/actions/auctions";

/**
 * Daily cron sweep for expired auctions (safety net).
 * Most auctions get closed on-demand when someone views them.
 * This catches any that nobody viewed after expiry.
 * 
 * Vercel Hobby: runs once daily at midnight UTC.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await closeExpiredAuctions();

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
  });
}
