"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFromCollectionAction } from "@/lib/actions/collections";
import { toast } from "@/components/ui/toaster";
import { X } from "lucide-react";

interface Props {
  collectionId: string;
  photoId: string;
}

export function RemoveFromCollectionButton({ collectionId, photoId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await removeFromCollectionAction(collectionId, photoId);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Removed from collection");
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors disabled:opacity-50"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
