"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/lib/actions/photos";
import { toast } from "@/components/ui/toaster";
import { cn, formatNumber } from "@/lib/utils";

interface LikeButtonProps {
  photoId: string;
  initialLiked: boolean;
  likeCount: number;
}

export function LikeButton({ photoId, initialLiked, likeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    startTransition(async () => {
      const result = await toggleLikeAction(photoId);
      if ("error" in result) {
        toast.error(result.error as string);
        setLiked(liked);
        setCount(count);
      }
    });
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(liked && "bg-red-500 hover:bg-red-600 border-red-500")}
    >
      <Heart className={cn("h-4 w-4 mr-2", liked && "fill-current")} />
      {formatNumber(count)}
    </Button>
  );
}
