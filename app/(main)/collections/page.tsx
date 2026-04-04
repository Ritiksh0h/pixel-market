import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collections, collectionPhotos, photos } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FolderOpen, ImageIcon } from "lucide-react";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userCollections = await db.query.collections.findMany({
    where: eq(collections.userId, session.user.id),
    with: {
      photos: {
        with: { photo: true },
        limit: 4,
        orderBy: desc(collectionPhotos.addedAt),
      },
    },
    orderBy: desc(collections.updatedAt),
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your saved photos into collections
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New collection
        </Button>
      </div>

      {userCollections.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any collections yet.
          </p>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create your first collection
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCollections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden group cursor-pointer hover:border-foreground/20 transition-colors">
              <div className="relative aspect-[16/10] bg-muted">
                {collection.photos.length > 0 ? (
                  <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                    {collection.photos.slice(0, 4).map((cp, i) => (
                      <div key={cp.photo.id} className="relative overflow-hidden">
                        <Image
                          src={cp.photo.thumbnailUrl}
                          alt={cp.photo.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="200px"
                        />
                      </div>
                    ))}
                    {/* Fill empty slots */}
                    {Array.from({ length: Math.max(0, 4 - collection.photos.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardContent className="pt-3 pb-3">
                <h3 className="font-semibold text-sm">{collection.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {collection.photos.length} photo{collection.photos.length !== 1 ? "s" : ""}
                  {collection.isPublic ? "" : " · Private"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
