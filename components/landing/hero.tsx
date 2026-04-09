"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero]", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      })

      gsap.to("[data-hero-bg]", {
        scale: 1.15,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      })

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

      gsap.to("[data-hero-overlay]", {
        opacity: 0.95,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "30% top",
          end: "bottom top",
          scrub: 1,
        },
      })

      // Floating orbs
      gsap.utils.toArray<HTMLElement>("[data-orb]").forEach((orb, i) => {
        gsap.to(orb, {
          y: `random(-40, 40)`,
          x: `random(-30, 30)`,
          duration: `random(4, 7)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        })
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

      {/* Floating orbs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div data-orb className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div data-orb className="absolute top-[60%] right-[15%] w-80 h-80 rounded-full bg-primary/3 blur-3xl" />
        <div data-orb className="absolute bottom-[20%] left-[40%] w-48 h-48 rounded-full bg-primary/4 blur-3xl" />
        <div data-orb className="absolute top-[30%] right-[30%] w-32 h-32 rounded-full bg-primary/6 blur-2xl" />
      </div>

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

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
          <Button size="lg" className="px-8 py-6 text-base" asChild>
            <Link href="/signup">
              Start Selling
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base border-muted-foreground/30 hover:bg-secondary"
            asChild
          >
            <Link href="/login">Explore Gallery</Link>
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
