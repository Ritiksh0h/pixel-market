"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, DollarSign, Shield, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Camera, title: "Showcase your work", desc: "Upload high-res photos with full EXIF metadata and custom licensing." },
  { icon: DollarSign, title: "Sell, rent, or auction", desc: "Three monetization models. Set your price, offer rentals, or let buyers bid." },
  { icon: Shield, title: "License protection", desc: "Watermarked previews, secure downloads, and clear license terms." },
  { icon: Zap, title: "Instant payouts", desc: "Stripe-powered payments. You keep 85% of every sale." },
];

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from("[data-hero]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });

      // Features scroll animation
      if (featuresRef.current) {
        gsap.from("[data-feature]", {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero — matches original full-bleed design */}
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1743653537429-a94889a6fd47?q=80&w=2944')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <header className="text-center mb-12 relative z-10" data-hero>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg" data-hero>
            Photo Market
          </h1>
          <p className="text-md text-gray-200 mt-4 max-w-md mx-auto drop-shadow-md" data-hero>
            Discover and trade breathtaking photography from creators worldwide.
          </p>
        </header>
        <main className="flex flex-col items-center space-y-4 relative z-10" data-hero>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "transition transform hover:scale-105"
            )}
          >
            Explore Photos
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "transition transform hover:scale-105"
            )}
          >
            Sell Your Photos
          </Link>
        </main>
      </div>

      {/* Features section (new addition on top of original) */}
      <section ref={featuresRef} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Built for photographers</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Everything you need to monetize your photography, with none of the complexity.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                data-feature
                className="group p-6 rounded-lg border bg-card hover:border-foreground/20 transition-colors duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">PixelMarket</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">About</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
