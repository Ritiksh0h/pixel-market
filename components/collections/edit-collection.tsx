"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCollectionAction } from "@/lib/actions/collections";
import { toast } from "@/components/ui/toaster";
import { Pencil, X } from "lucide-react";

interface Props {
  collection: { id: string; name: string; description: string | null; isPublic: boolean };
}

export function EditCollectionForm({ collection }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("collectionId", collection.id);
    startTransition(async () => {
      const result = await updateCollectionAction(fd);
      if ("error" in result) toast.error(result.error as string);
      else {
        toast.success("Collection updated");
        setEditing(false);
        router.refresh();
      }
    });
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card w-full max-w-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Edit collection</h3>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="name" defaultValue={collection.name} placeholder="Name" required maxLength={100} />
        <Input name="description" defaultValue={collection.description || ""} placeholder="Description (optional)" maxLength={300} />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="isPublic" defaultChecked={collection.isPublic} className="rounded" />
          Public
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="flex-1" loading={isPending}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
