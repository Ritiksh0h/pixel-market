import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { purchases, photos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingBag, ExternalLink } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userPurchases = await db.query.purchases.findMany({
    where: eq(purchases.buyerId, session.user.id),
    with: {
      photo: {
        columns: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          originalUrl: true,
        },
      },
    },
    orderBy: desc(purchases.createdAt),
  });

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">My Purchases</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {userPurchases.length} purchase{userPurchases.length !== 1 ? "s" : ""}
      </p>

      {userPurchases.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">You haven&apos;t purchased any photos yet.</p>
          <Button asChild>
            <Link href="/dashboard">Browse photos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {userPurchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/photos/${purchase.photo.slug}`} className="shrink-0">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={purchase.photo.thumbnailUrl}
                        alt={purchase.photo.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/photos/${purchase.photo.slug}`} className="font-medium text-sm hover:underline">
                          {purchase.photo.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{purchase.type}</Badge>
                          <Badge variant={purchase.status === "completed" ? "success" : "outline"} className="text-xs capitalize">
                            {purchase.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${purchase.price.toFixed(2)} · {timeAgo(new Date(purchase.createdAt))}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {purchase.status === "completed" && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={purchase.photo.originalUrl} download={purchase.photo.title} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Download
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/photos/${purchase.photo.slug}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
