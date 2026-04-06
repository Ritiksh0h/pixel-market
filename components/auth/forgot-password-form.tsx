"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { toast } from "@/components/ui/toaster";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { ArrowLeft, Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(fd);
    if ("error" in result) {
      toast.error(result.error as string);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm text-muted-foreground">
          If an account exists with that email, you&apos;ll receive a password reset link shortly. Check your spam folder too.
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
      <Button variant="ghost" asChild className="w-full">
        <Link href="/login">
          <ArrowLeft className="mr-2 h-4 w-4" />Back to login
        </Link>
      </Button>
    </form>
  );
}
