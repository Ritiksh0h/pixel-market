"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-sm md:max-w-3xl overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <Link href="/" className="text-xl font-bold mb-1 inline-block">PixelMarket</Link>
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-sm text-muted-foreground mt-1">Start selling or collecting photos today</p>
              </div>
              <SignupForm />
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <Image
              width={600}
              height={800}
              src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        By continuing, you agree to our <a href="#" className="underline underline-offset-4 hover:text-foreground">Terms of Service</a> and <a href="#" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>.
      </p>
    </div>
  );
}
