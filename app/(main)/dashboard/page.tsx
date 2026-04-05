import { getFeedPhotos } from "@/lib/actions/photos";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CategoryFilter } from "@/components/dashboard/category-filter";
import { InfinitePhotoGrid } from "@/components/photos/infinite-grid";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryId = searchParams.category;

  const [photos, allCategories] = await Promise.all([
    getFeedPhotos(1, 20, categoryId),
    db.select().from(categories),
  ]);

  return (
    <div className="container py-6">
      {/* Category filter */}
      <CategoryFilter
        categories={allCategories}
        activeCategory={categoryId}
      />

      <div className="mx-auto container grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Photo grid with infinite scroll */}
        <div className="lg:col-span-2">
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
            <InfinitePhotoGrid initialPhotos={photos} category={categoryId} />
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <DashboardSidebar categories={allCategories} />
        </div>
      </div>
    </div>
  );
}
