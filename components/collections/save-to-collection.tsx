"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUserCollections,
  togglePhotoInCollectionAction,
  createCollectionAction,
} from "@/lib/actions/collections";
import { toast } from "@/components/ui/toaster";
import { Bookmark, Check, Plus, X, FolderOpen, Loader2 } from "lucide-react";

interface SaveToCollectionProps {
  photoId: string;
}

type CollectionItem = {
  id: string;
  name: string;
  isPublic: boolean;
  photoCount: number;
  containsPhoto: boolean;
};

export function SaveToCollectionButton({ photoId }: SaveToCollectionProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch collections when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      getUserCollections(photoId).then((data) => {
        setCollections(data as CollectionItem[]);
        setLoading(false);
      });
    }
  }, [open, photoId]);

  function handleToggle(collectionId: string) {
    // Optimistic update
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, containsPhoto: !c.containsPhoto } : c
      )
    );

    startTransition(async () => {
      const result = await togglePhotoInCollectionAction(collectionId, photoId);
      if ("error" in result) {
        toast.error(result.error as string);
        // Revert
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, containsPhoto: !c.containsPhoto } : c
          )
        );
      }
    });
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCollectionAction(fd);
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        // Add photo to new collection
        if ("id" in result && result.id) {
          await togglePhotoInCollectionAction((result as any).id, photoId);
        }
        toast.success("Created and saved!");
        setCreating(false);
        // Refresh list
        const data = await getUserCollections(photoId);
        setCollections(data as CollectionItem[]);
      }
    });
  }

  const isSaved = collections.some((c) => c.containsPhoto);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className={isSaved ? "text-foreground" : ""}
      >
        <Bookmark className={`h-4 w-4 mr-1.5 ${isSaved ? "fill-current" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 left-0 z-50 w-72 rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-sm font-semibold">Save to collection</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[250px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : collections.length === 0 && !creating ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <FolderOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  No collections yet
                </div>
              ) : (
                <div className="py-1">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleToggle(c.id)}
                      disabled={isPending}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          c.containsPhoto
                            ? "bg-foreground border-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {c.containsPhoto && <Check className="h-3 w-3 text-background" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.photoCount} photo{c.photoCount !== 1 ? "s" : ""}
                          {!c.isPublic && " · Private"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create new */}
            <div className="border-t p-3">
              {creating ? (
                <form onSubmit={handleCreate} className="space-y-2">
                  <Input
                    name="name"
                    placeholder="Collection name"
                    required
                    autoFocus
                    maxLength={100}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setCreating(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="flex-1 h-7 text-xs" loading={isPending}>
                      Create & save
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create new collection
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
