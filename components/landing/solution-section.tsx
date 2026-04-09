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
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="min-h-[70vh] flex items-center justify-center py-32 px-6 bg-secondary/30"
    >
      <div className="max-w-4xl mx-auto text-center">
        <p
          data-solution
          className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-8"
        >
          Introducing PixelMarket
        </p>
        <h2
          data-solution
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-balance"
        >
          Turn your photos into a revenue stream.
        </h2>
      </div>
    </section>
  )
}
