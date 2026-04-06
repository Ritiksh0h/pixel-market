"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollowAction } from "@/lib/actions/users";
import { toast } from "@/components/ui/toaster";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setFollowing(!following);
    startTransition(async () => {
      const result = await toggleFollowAction(userId);
      if ("error" in result) {
        toast.error(result.error as string);
        setFollowing(following);
      }
    });
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
