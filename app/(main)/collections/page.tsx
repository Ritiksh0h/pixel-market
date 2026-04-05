import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserCollections } from "@/lib/actions/collections";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, ImageIcon, Lock } from "lucide-react";
import { CreateCollectionButton } from "@/components/collections/create-collection";
import { DeleteCollectionButton } from "@/components/collections/delete-collection";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userCollections = await getUserCollections();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your saved photos into collections
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      {userCollections.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any collections yet.
          </p>
          <CreateCollectionButton />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCollections.map((collection) => (
            <div key={collection.id} className="relative group">
              <Link href={`/collections/${collection.id}`}>
                <Card className="overflow-hidden hover:border-foreground/20 transition-colors">
                  <div className="relative aspect-[16/10] bg-muted">
                    {collection.photos.length > 0 ? (
                      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                        {collection.photos.slice(0, 4).map((cp: any) => (
                          <div key={cp.photo.id} className="relative overflow-hidden">
                            <Image
                              src={cp.photo.thumbnailUrl}
                              alt=""
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="200px"
                            />
                          </div>
                        ))}
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{collection.name}</h3>
                      {!collection.isPublic && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {collection.photoCount} photo{collection.photoCount !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
              {/* Delete button — top right on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteCollectionButton collectionId={collection.id} name={collection.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
