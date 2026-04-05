"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCollectionAction } from "@/lib/actions/collections";
import { toast } from "@/components/ui/toaster";
import { Plus, X } from "lucide-react";

export function CreateCollectionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCollectionAction(fd);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Collection created");
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New collection
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 w-full max-w-sm space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New collection</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" placeholder="Collection name" required autoFocus maxLength={100} />
        <Input name="description" placeholder="Description (optional)" maxLength={300} />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="isPublic" defaultChecked className="rounded" />
            Public
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="flex-1" loading={isPending}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
