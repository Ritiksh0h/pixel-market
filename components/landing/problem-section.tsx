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
      // Per-line scrub reveal
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

      // Background parallax — once, outside the loop
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
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        {problemLines.map((line, index) => (
          <p
            key={index}
            data-problem-line
            className={`text-2xl md:text-4xl lg:text-3xl leading-tight ${
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