import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { photos, purchases } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: { photoId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, params.photoId),
  });

  if (!photo) notFound();

  return (
    <div className="container py-16 max-w-md mx-auto">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold">Purchase complete!</h1>
          <p className="text-muted-foreground">
            Your license has been activated. You can now download the full-resolution photo.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full" size="lg" asChild>
              <a href={photo.originalUrl} download={photo.title} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download photo
              </a>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/photos/${photo.slug}`}>
                View photo page
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard">
                Continue browsing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
