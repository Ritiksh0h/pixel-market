"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminPhotos, adminDeletePhoto, adminTogglePhotoPublish } from "@/lib/actions/admin";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import {
  Search, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight,
  ImageIcon, ExternalLink, Filter,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

type Photo = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  isPublished: boolean;
  forSale: boolean;
  salePrice: number | null;
  likeCount: number;
  viewCount: number;
  createdAt: Date;
  user: { id: string; name: string | null; username: string | null; email: string };
};

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "archived">("all");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  function load(p: number, q: string, f: typeof filter) {
    setLoading(true);
    getAdminPhotos(p, 20, q || undefined, f).then((data) => {
      setPhotos(data.photos as Photo[]);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setLoading(false);
    });
  }

  useEffect(() => { load(1, "", "all"); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(1, search, filter);
  }

  function handleFilter(f: typeof filter) {
    setFilter(f);
    load(1, search, f);
  }

  function handleTogglePublish(photoId: string) {
    startTransition(async () => {
      const result = await adminTogglePhotoPublish(photoId);
      if ("error" in result) toast.error(result.error as string);
      else {
        toast.success(result.isPublished ? "Photo published" : "Photo archived");
        load(page, search, filter);
      }
    });
  }

  function handleDelete(photoId: string, title: string) {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await adminDeletePhoto(photoId);
      if ("error" in result) toast.error(result.error as string);
      else {
        toast.success("Photo deleted");
        load(page, search, filter);
      }
    });
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search photos..." className="pl-9" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "published", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
              filter === f
                ? "bg-foreground text-background font-medium"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No photos found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {photos.map((photo) => (
              <Card key={photo.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/photos/${photo.slug}`} className="shrink-0">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted">
                        <Image src={photo.thumbnailUrl} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/photos/${photo.slug}`} className="text-sm font-medium hover:underline truncate">
                          {photo.title}
                        </Link>
                        <Badge variant={photo.isPublished ? "success" : "outline"} className="text-[10px] shrink-0">
                          {photo.isPublished ? "Published" : "Archived"}
                        </Badge>
                        {photo.forSale && photo.salePrice && (
                          <Badge variant="outline" className="text-[10px] shrink-0">${photo.salePrice}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        by {photo.user.name || photo.user.username} ({photo.user.email}) · {timeAgo(new Date(photo.createdAt))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {photo.viewCount} views · {photo.likeCount} likes
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/photos/${photo.slug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(photo.id)}
                        disabled={isPending}
                        title={photo.isPublished ? "Archive" : "Publish"}
                      >
                        {photo.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(photo.id, photo.title)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load(page - 1, search, filter)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => load(page + 1, search, filter)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
