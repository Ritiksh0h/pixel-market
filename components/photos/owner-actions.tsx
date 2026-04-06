"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deletePhotoAction } from "@/lib/actions/photos";
import { toast } from "@/components/ui/toaster";
import { Trash2, Pencil, Archive, ArchiveRestore, Loader2 } from "lucide-react";

interface OwnerActionsProps {
  photoId: string;
  photoSlug: string;
  isPublished: boolean;
}

export function OwnerActions({ photoId, photoSlug, isPublished }: OwnerActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePhotoAction(photoId);
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success("Photo deleted");
        router.push("/dashboard");
      }
    });
  }

  async function handleArchive() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/photos/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId, publish: !isPublished }),
        });
        if (res.ok) {
          toast.success(isPublished ? "Photo archived" : "Photo restored");
          router.refresh();
        } else {
          toast.error("Failed to update photo");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manage</h3>

      {/* Edit */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => router.push(`/upload?edit=${photoSlug}`)}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit photo
      </Button>

      {/* Archive / Unarchive */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={handleArchive}
        disabled={isPending}
      >
        {isPublished ? (
          <>
            <Archive className="h-4 w-4 mr-2" />
            Archive (hide from feed)
          </>
        ) : (
          <>
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Restore to feed
          </>
        )}
      </Button>

      {/* Delete */}
      {!showConfirm ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete photo
        </Button>
      ) : (
        <div className="space-y-2 p-3 rounded-md border border-destructive/30 bg-destructive/5">
          <p className="text-xs text-destructive font-medium">
            This will permanently delete this photo and all associated data (likes, comments, purchases). This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
