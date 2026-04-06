"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleFollowAction } from "@/lib/actions/users";
import { toast } from "@/components/ui/toaster";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  /** If provided, shows count and updates it optimistically */
  followerCount?: number;
}

export function FollowButton({ userId, initialFollowing, followerCount }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount ?? 0);
  const [isPending, startTransition] = useTransition();
  const showCount = followerCount !== undefined;

  function handleClick() {
    const wasFollowing = following;
    setFollowing(!following);
    if (showCount) setCount((c) => wasFollowing ? c - 1 : c + 1);

    startTransition(async () => {
      const result = await toggleFollowAction(userId);
      if ("error" in result) {
        toast.error(result.error as string);
        setFollowing(wasFollowing);
        if (showCount) setCount((c) => wasFollowing ? c + 1 : c - 1);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={following ? "outline" : "default"}
        size="sm"
        onClick={handleClick}
        disabled={isPending}
      >
        {following ? (
          <><UserCheck className="h-4 w-4 mr-1.5" />Following</>
        ) : (
          <><UserPlus className="h-4 w-4 mr-1.5" />Follow</>
        )}
      </Button>
      {showCount && (
        <span className="text-sm text-muted-foreground">{count} followers</span>
      )}
    </div>
  );
}
