"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-cta]", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      })

      gsap.utils.toArray<HTMLElement>("[data-cta-orb]").forEach((orb, i) => {
        gsap.to(orb, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          duration: `random(5, 8)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.8,
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-40 px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div data-cta-orb className="absolute top-[20%] left-[5%] w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div data-cta-orb className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 data-cta className="text-4xl md:text-5xl lg:text-6xl font-medium mb-8 leading-tight">
          Start earning from your photography today.
        </h2>
        <p data-cta className="text-lg text-muted-foreground mb-12">
          Join thousands of photographers who chose to take control.
        </p>
        <div data-cta>
          <Button size="lg" className="px-12 py-7 text-lg group" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <p data-cta className="mt-6 text-sm text-muted-foreground">
          No credit card required. Upload your first photo in minutes.
        </p>
      </div>
    </section>
  )
}
