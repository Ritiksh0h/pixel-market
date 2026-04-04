import { Suspense } from "react";
import { getFeedPhotos } from "@/lib/actions/photos";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { PhotoCard } from "@/components/photos/photo-card";
import { Skeleton } from "@/components/ui/skeleton-label-separator";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CategoryFilter } from "@/components/dashboard/category-filter";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const categoryId = searchParams.category;

  const [photos, allCategories] = await Promise.all([
    getFeedPhotos(page, 30, categoryId),
    db.select().from(categories),
  ]);

  return (
    <div className="container py-6">
      {/* Category filter */}
      <CategoryFilter
        categories={allCategories}
        activeCategory={categoryId}
      />

      <div className="mx-auto container grid grid-cols-3 mt-6">
        {/* Photo grid */}
        <div className="col-span-2">
          {photos.length === 0 ? (
            <div className="text-center py-20 px-4">
              <p className="text-muted-foreground text-lg">
                No photos yet. Be the first to{" "}
                <a href="/upload" className="text-foreground underline">
                  upload one
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="columns-masonry p-4">
              {photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo as any} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
          <DashboardSidebar categories={allCategories} />
        </div>
      </div>
    </div>
  );
}
