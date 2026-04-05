"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCollectionAction } from "@/lib/actions/collections";
import { toast } from "@/components/ui/toaster";
import { Trash2 } from "lucide-react";

interface Props {
  collectionId: string;
  name: string;
}

export function DeleteCollectionButton({ collectionId, name }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCollectionAction(collectionId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Collection deleted");
        router.refresh();
      }
    });
  }

  if (!confirm) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(true); }}
        className="h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="bg-card border rounded-lg p-3 shadow-lg space-y-2 min-w-[200px]"
    >
      <p className="text-xs">Delete &quot;{name}&quot;?</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setConfirm(false)}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" className="flex-1 h-7 text-xs" onClick={handleDelete} loading={isPending}>
          Delete
        </Button>
      </div>
    </div>
  );
}
