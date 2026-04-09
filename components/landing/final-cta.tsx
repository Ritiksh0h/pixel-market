"use client"

import { useEffect, useRef } from "react"
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
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-40 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 data-cta className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium mb-8 leading-tight">
          Start earning from your photography today.
        </h2>
        <p data-cta className="text-lg text-muted-foreground mb-12">
          Join thousands of photographers who chose to take control.
        </p>
        <div data-cta>
          <Button size="lg" className="px-12 py-7 text-lg group">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <p data-cta className="mt-6 text-sm text-muted-foreground">
          No credit card required. Upload your first photo in minutes.
        </p>
      </div>
    </section>
  )
}
