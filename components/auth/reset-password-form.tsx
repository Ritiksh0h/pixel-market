"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { toast } from "@/components/ui/toaster";
import { resetPasswordAction } from "@/lib/actions/auth";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Invalid or missing reset token.</p>
        <Button asChild><Link href="/forgot-password">Request a new link</Link></Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="text-sm text-muted-foreground">Your password has been reset. You can now sign in.</p>
        <Button asChild className="w-full"><Link href="/login">Sign in</Link></Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append("token", token!);

    const pw = fd.get("password") as string;
    const confirm = fd.get("confirmPassword") as string;
    if (pw !== confirm) { toast.error("Passwords do not match"); setLoading(false); return; }

    const result = await resetPasswordAction(fd);
    if ("error" in result) { toast.error(result.error as string); } else { setDone(true); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input id="password" name="password" type={showPw ? "text" : "password"} placeholder="Min 8 characters" required minLength={8} />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password" required minLength={8} />
      </div>
      <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
    </form>
  );
}
