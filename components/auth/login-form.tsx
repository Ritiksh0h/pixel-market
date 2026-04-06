"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/skeleton-label-separator";
import { Separator } from "@/components/ui/skeleton-label-separator";
import { toast } from "@/components/ui/toaster";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Mail, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [mode, setMode] = useState<"credentials" | "magic">("credentials");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleCredentialLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    if (res?.error) {
      toast.error("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("nodemailer", {
      email: fd.get("email"),
      redirect: false,
      callbackUrl,
    });
    if (res?.error) {
      toast.error("Failed to send magic link");
    } else {
      toast.success("Check your email for a magic link!");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <OAuthButtons callbackUrl={callbackUrl} disabled={loading} />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${mode === "credentials" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
          onClick={() => setMode("credentials")}
        >
          Password
        </button>
        <button
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${mode === "magic" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
          onClick={() => setMode("magic")}
        >
          Magic link
        </button>
      </div>

      {mode === "credentials" ? (
        <form onSubmit={handleCredentialLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input id="password" name="password" type={showPw ? "text" : "password"} placeholder="Enter your password" required minLength={8} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input id="magic-email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            <Mail className="mr-2 h-4 w-4" />Send magic link
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
