"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const differentiators = [
  { title: "You keep 85%", description: "Other platforms take 40-60%. We believe creators deserve more.", highlight: "85%" },
  { title: "You control pricing", description: "Set your own prices. No race to the bottom. Your art, your value.", highlight: "Your price" },
  { title: "No algorithm games", description: "Quality rises. No pay-to-play. No hidden suppression.", highlight: "Fair discovery" },
  { title: "Weekly payouts", description: "Get paid every Friday. No 60-day holds. No minimum thresholds.", highlight: "Every week" },
]

export function Differentiation() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-diff]", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">Why PixelMarket</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium">Built Different</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {differentiators.map((item) => (
            <div key={item.title} data-diff className="p-8 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-sm mb-2 text-muted-foreground">{item.highlight}</p>
                  <h3 className="text-2xl font-medium mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
