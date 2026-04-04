import { searchPhotosAction } from "@/lib/actions/photos";
import { PhotoCard } from "@/components/photos/photo-card";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");

  const results = query ? await searchPhotosAction(query, page) : null;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        {results && (
          <p className="text-sm text-muted-foreground">
            {results.total} photo{results.total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Search for photos, photographers, or tags
          </p>
        </div>
      )}

      {results && results.photos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            No photos found for &quot;{query}&quot;. Try a different search.
          </p>
        </div>
      )}

      {results && results.photos.length > 0 && (
        <>
          <div className="columns-masonry">
            {results.photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo as any} />
            ))}
          </div>

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <a
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                    className={`h-9 w-9 rounded-md flex items-center justify-center text-sm transition-colors ${
                      p === page
                        ? "bg-foreground text-background"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {p}
                  </a>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
