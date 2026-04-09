"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.from("[data-hero]", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      })

      // Parallax background zoom on scroll
      gsap.to("[data-hero-bg]", {
        scale: 1.15,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      })

      // Text fades out + shifts up on scroll
      gsap.to("[data-hero-content]", {
        opacity: 0,
        y: -60,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "25% top",
          end: "65% top",
          scrub: 1,
        },
      })

      // Overlay darkens on scroll
      gsap.to("[data-hero-overlay]", {
        opacity: 0.9,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "30% top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        data-hero-bg
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div data-hero-overlay className="absolute inset-0 bg-background/70" />

      <div data-hero-content className="relative z-10 text-center px-6 max-w-4xl mx-auto will-change-transform">
        <p data-hero className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-8">
          The Premium Photography Marketplace
        </p>

        <h1 data-hero className="text-5xl md:text-7xl font-medium leading-[1.1] mb-8 text-balance">
          Your Art,
          <br />
          Your Income
        </h1>

        <p data-hero className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
          Turn your photography into a revenue stream. Keep 85% of every sale.
        </p>

        <div data-hero className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="px-8 py-6 text-base">
            Start Selling
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base border-muted-foreground/30 hover:bg-secondary"
          >
            Explore Gallery
          </Button>
        </div>
      </div>

      <div data-hero className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Scroll to explore
        </span>
        <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
      </div>
    </section>
  )
}
