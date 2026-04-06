"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addCommentAction } from "@/lib/actions/photos";
import { toast } from "@/components/ui/toaster";
import { getInitials, timeAgo } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";
import Link from "next/link";

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface CommentSectionProps {
  photoId: string;
  comments: Comment[];
}

export function CommentSection({ photoId, comments: initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const commentText = text;
    setText("");

    // Optimistic add
    if (session?.user) {
      setComments((prev) => [
        {
          id: "temp-" + Date.now(),
          text: commentText,
          createdAt: new Date(),
          user: {
            id: session.user.id,
            name: session.user.name || null,
            username: (session.user as any).username || null,
            image: session.user.image || null,
          },
        },
        ...prev,
      ]);
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("photoId", photoId);
      fd.append("text", commentText);
      const result = await addCommentAction(fd);
      if ("error" in result) {
        toast.error(result.error as string);
        setComments(initialComments);
        setText(commentText);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      {/* Add comment */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback className="text-xs">{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              maxLength={1000}
            />
            <Button type="submit" size="sm" disabled={!text.trim() || isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="underline">Sign in</Link> to leave a comment.
        </p>
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Link href={`/photographers/${comment.user.username}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback className="text-[10px]">{getInitials(comment.user.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Link href={`/photographers/${comment.user.username}`} className="text-sm font-medium hover:underline">
                  {comment.user.name || comment.user.username}
                </Link>
                <span className="text-xs text-muted-foreground">{timeAgo(new Date(comment.createdAt))}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
