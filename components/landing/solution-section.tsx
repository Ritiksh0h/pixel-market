"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-solution]", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
        scale: 0.92,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      })

      gsap.utils.toArray<HTMLElement>("[data-sol-orb]").forEach((orb, i) => {
        gsap.to(orb, {
          y: `random(-25, 25)`,
          x: `random(-20, 20)`,
          duration: `random(5, 8)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.6,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[70vh] flex items-center justify-center py-32 px-6 bg-secondary/30 overflow-hidden"
    >
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div data-sol-orb className="absolute top-[20%] right-[20%] w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
        <div data-sol-orb className="absolute bottom-[25%] left-[15%] w-64 h-64 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p
          data-solution
          className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-8"
        >
          Introducing PixelMarket
        </p>
        <h2
          data-solution
          className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-balance"
        >
          Turn your photos into a revenue stream.
        </h2>
      </div>
    </section>
  )
}
