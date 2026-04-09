"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Zap, Globe, BarChart3, Lock, Palette } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Shield,
    title: "Your Rights Protected",
    description: "Watermarking, DMCA takedowns, and license tracking built in.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Uploads",
    description:
      "Batch upload hundreds of photos. AI-powered tagging saves hours.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Buyers from 150+ countries. Multi-currency support included.",
  },
  {
    icon: BarChart3,
    title: "Real Analytics",
    description:
      "Know what sells. Track views, favorites, and conversion rates.",
  },
  {
    icon: Lock,
    title: "Secure Transactions",
    description: "Bank-level encryption. Fraud protection on every sale.",
  },
  {
    icon: Palette,
    title: "Custom Portfolio",
    description:
      "Your own branded page. Share anywhere. Drive traffic your way.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-feature]", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.to("[data-features-bg]", {
        scale: 1.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <div
        data-features-bg
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1767711384997-6804f4b54997?q=80&w=2940')`,
        }}
      />
      <div className="absolute inset-0 bg-background/85" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Everything You Need
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tools built specifically for photographers who are serious about
            their craft and their income.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                data-feature
                className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
