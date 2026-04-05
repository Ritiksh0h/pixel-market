import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collections, collectionPhotos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import { RemoveFromCollectionButton } from "@/components/collections/remove-from-collection";
import { EditCollectionForm } from "@/components/collections/edit-collection";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, params.id), eq(collections.userId, session.user.id)),
    with: {
      photos: {
        with: { photo: true },
        orderBy: desc(collectionPhotos.addedAt),
      },
    },
  });

  if (!collection) notFound();

  return (
    <div className="container py-8">
      {/* Back link */}
      <Link href="/collections" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        All collections
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <Badge variant="outline" className="text-xs">
              {collection.isPublic ? (
                <><Globe className="h-3 w-3 mr-1" />Public</>
              ) : (
                <><Lock className="h-3 w-3 mr-1" />Private</>
              )}
            </Badge>
          </div>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {collection.photos.length} photo{collection.photos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <EditCollectionForm collection={collection} />
      </div>

      {/* Photo grid */}
      {collection.photos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="mb-2">This collection is empty.</p>
          <p className="text-sm">Save photos from the dashboard or photo detail pages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {collection.photos.map((cp: any) => (
            <div key={cp.photo.id} className="relative group">
              <Link href={`/photos/${cp.photo.slug}`}>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={cp.photo.thumbnailUrl}
                    alt={cp.photo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{cp.photo.title}</p>
                  </div>
                </div>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <RemoveFromCollectionButton collectionId={collection.id} photoId={cp.photo.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
