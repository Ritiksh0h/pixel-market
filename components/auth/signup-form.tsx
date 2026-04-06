"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { Separator } from "@/components/ui/skeleton-label-separator";
import { toast } from "@/components/ui/toaster";
import { signupAction } from "@/lib/actions/auth";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Eye, EyeOff } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const pw = fd.get("password") as string;
    const confirm = fd.get("confirmPassword") as string;
    if (pw !== confirm) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await signupAction(fd);
    if ("error" in result) {
      toast.error(result.error as string);
      setLoading(false);
    } else {
      toast.success("Account created!");
      await signIn("credentials", {
        email: fd.get("email"),
        password: fd.get("password"),
        redirect: false,
      });
      router.push("/dashboard");
    }
  }

  return (
    <div className="space-y-4">
      <OAuthButtons disabled={loading} />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" placeholder="Jane Doe" required minLength={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" name="password" type={showPw ? "text" : "password"} placeholder="Min 8 characters" required minLength={8} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat your password" required minLength={8} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>Create account</Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
