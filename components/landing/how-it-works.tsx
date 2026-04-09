"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Upload, DollarSign, Users, CreditCard } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drag and drop your best work. We handle the rest.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Set Your Price",
    description: "You decide what your art is worth. No limits.",
    icon: DollarSign,
  },
  {
    number: "03",
    title: "Get Discovered",
    description: "Your work reaches buyers actively searching for quality.",
    icon: Users,
  },
  {
    number: "04",
    title: "Get Paid",
    description: "85% of every sale goes directly to you. Weekly payouts.",
    icon: CreditCard,
  },
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {

      // Desktop: pin the section and drive step changes
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${steps.length * 100}%`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * steps.length),
              steps.length - 1
            )
            setActiveStep(idx)
          },
        })
      })

      // Mobile: simple stagger reveal
      mm.add("(max-width: 1023px)", () => {
        gsap.from("[data-step-mobile]", {
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
        })
      })

    }, sectionRef)

    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <div ref={sectionRef}>
      {/* Desktop: pinned layout */}
      <div className="hidden lg:flex min-h-screen flex-col justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              How It Works
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium">
              Simple. Fast. Inevitable.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep
                const isPast = index < activeStep

                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-6 rounded-lg border transition-all duration-500 ${
                      isActive
                        ? "border-foreground/20 bg-foreground/5"
                        : isPast
                        ? "border-border/50 opacity-40"
                        : "border-border/30 opacity-25"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isActive ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-muted-foreground font-mono">{step.number}</span>
                          <h3 className="text-xl font-medium">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}

              {/* Progress dots */}
              <div className="flex justify-center gap-2 pt-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === activeStep ? "w-8 bg-foreground" : i < activeStep ? "w-4 bg-foreground/30" : "w-4 bg-foreground/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Visuals */}
            <div className="relative h-[500px] rounded-xl overflow-hidden bg-card border border-border">
              {/* Step 1: Upload */}
              <div className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-700 ${activeStep === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                <div className="w-full max-w-sm border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop your photos here</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 50MB</p>
                </div>
              </div>

              {/* Step 2: Pricing */}
              <div className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-700 ${activeStep === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                <div className="w-full max-w-sm space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Your Price</p>
                    <p className="text-5xl font-serif">$29</p>
                  </div>
                  <div className="space-y-3">
                    {["Standard License", "Extended License", "Exclusive Rights"].map((tier, i) => (
                      <div key={tier} className={`p-4 rounded-lg border ${i === 0 ? "border-foreground/20 bg-foreground/5" : "border-border"}`}>
                        <div className="flex justify-between items-center">
                          <span>{tier}</span>
                          <span className="font-mono">${[29, 99, 499][i]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Gallery */}
              <div className={`absolute inset-0 p-4 transition-all duration-700 ${activeStep === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                <div className="grid grid-cols-3 gap-2 h-full">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-secondary rounded-lg" style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-${["1506905925346-21bda4d32df4","1469474968028-56623f02e42e","1426604966848-d7adac402bff","1472214103451-9374bd1c798e","1470071459604-3b5ec3a7fe05","1441974231531-c6227db76b6e","1518173946687-a4c8892bbd9f","1475924156734-496f6cac6ec1","1507400492013-162706c8c05e"][i]}?w=200&h=200&fit=crop')`,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }} />
                  ))}
                </div>
              </div>

              {/* Step 4: Earnings */}
              <div className={`absolute inset-0 flex items-center justify-center p-8 transition-all duration-700 ${activeStep === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
                <div className="w-full max-w-sm space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">This Month</p>
                    <p className="text-5xl font-serif">$2,847</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: "85%" }} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Your earnings (85%)</span>
                      <span>$2,420</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Next payout</span>
                      <span className="font-medium">Friday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="lg:hidden py-24 px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">How It Works</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium">Simple. Fast. Inevitable.</h2>
        </div>
        <div className="space-y-4 max-w-sm mx-auto">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} data-step-mobile className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-mono">{step.number}</span>
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
