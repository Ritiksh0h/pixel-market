"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface ShareButtonProps {
  title: string;
  slug: string;
}

export function ShareButton({ title, slug }: ShareButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}/photos/${slug}`;

    // Try native share (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-1.5" />
      Share
    </Button>
  );
}
