"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { getFeedPhotos } from "@/lib/actions/photos";
import { PhotoCard } from "@/components/photos/photo-card";
import { Loader2 } from "lucide-react";

interface InfinitePhotoGridProps {
  initialPhotos: any[];
  category?: string;
}

export function InfinitePhotoGrid({ initialPhotos, category }: InfinitePhotoGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [page, setPage] = useState(2); // Start at 2 since page 1 is server-rendered
  const [hasMore, setHasMore] = useState(initialPhotos.length >= 20);
  const [isPending, startTransition] = useTransition();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when category changes
  useEffect(() => {
    setPhotos(initialPhotos);
    setPage(2);
    setHasMore(initialPhotos.length >= 20);
  }, [initialPhotos, category]);

  // IntersectionObserver to trigger load more
  useEffect(() => {
    if (!hasMore || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending && hasMore) {
          loadMore();
        }
      },
      { rootMargin: "400px" } // Start loading 400px before reaching bottom
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isPending, page]);

  function loadMore() {
    startTransition(async () => {
      const newPhotos = await getFeedPhotos(page, 20, category);
      if (newPhotos.length < 20) {
        setHasMore(false);
      }
      if (newPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotos]);
        setPage((p) => p + 1);
      }
    });
  }

  return (
    <>
      <div className="columns-masonry p-4">
        {photos.map((photo: any) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more photos...
            </div>
          )}
        </div>
      )}

      {!hasMore && photos.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          You&apos;ve seen all photos
        </p>
      )}
    </>
  );
}
