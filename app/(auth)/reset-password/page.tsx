"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-sm md:max-w-3xl overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-xl font-bold mb-1">PixelMarket</span>
                <h1 className="text-2xl font-bold">Set new password</h1>
                <p className="text-sm text-muted-foreground mt-1">Choose a strong password</p>
              </div>
              <Suspense>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <Image
              width={600}
              height={800}
              src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=800&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
