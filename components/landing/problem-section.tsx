"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const problemLines = [
  "Most photographers never earn from their work.",
  "Their photos get likes. Not income.",
  "Algorithms decide who sees their art.",
  "Platforms take massive cuts.",
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-problem-line]").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
          y: 30,
          opacity: 0,
        });
      });

      gsap.to("[data-problem-bg]", {
        scale: 1.15,
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
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden"
    >
      <div
        data-problem-bg
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1743653537429-a94889a6fd47?q=80&w=2944')`,
        }}
      />
      <div className="absolute inset-0 bg-background/85" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        {problemLines.map((line, index) => (
          <p
            key={index}
            data-problem-line
            className={`text-2xl md:text-3xl lg:text-4xl leading-tight ${
              index === problemLines.length - 1
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
