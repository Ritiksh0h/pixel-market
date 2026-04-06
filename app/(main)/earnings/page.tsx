import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { purchases, photos } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get all sales where user is the seller
  const sales = await db.query.purchases.findMany({
    where: and(eq(purchases.sellerId, session.user.id), eq(purchases.status, "completed")),
    with: {
      photo: { columns: { id: true, title: true, slug: true, thumbnailUrl: true } },
      buyer: { columns: { id: true, name: true, username: true } },
    },
    orderBy: desc(purchases.createdAt),
  });

  // Calculate stats
  const totalRevenue = sales.reduce((sum, s) => sum + s.sellerEarnings, 0);
  const totalSales = sales.length;
  const platformFees = sales.reduce((sum, s) => sum + s.platformFee, 0);
  const thisMonthSales = sales.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonthSales.reduce((sum, s) => sum + s.sellerEarnings, 0);

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Earnings</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your sales and revenue</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-lg font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-bold">${monthlyRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-lg font-bold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform Fees</p>
                <p className="text-lg font-bold">${platformFees.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales list */}
      <h2 className="text-lg font-semibold mb-4">Sales History</h2>
      {sales.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No sales yet. Upload and list photos to start earning.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Link href={`/photos/${sale.photo.slug}`} className="shrink-0">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                      <Image src={sale.photo.thumbnailUrl} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/photos/${sale.photo.slug}`} className="text-sm font-medium hover:underline truncate block">
                      {sale.photo.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Purchased by {sale.buyer.name || sale.buyer.username} · {timeAgo(new Date(sale.createdAt))}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +${sale.sellerEarnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of ${sale.price.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{sale.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
