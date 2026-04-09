"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const previewPanels = [
  { title: "Your Dashboard" },
  { title: "Photo Details" },
  { title: "Earnings Analytics" },
]

export function ProductPreview() {
  const [activePanel, setActivePanel] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {

      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${previewPanels.length * 100}%`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * previewPanels.length),
              previewPanels.length - 1
            )
            setActivePanel(idx)
          },
        })
      })

      mm.add("(max-width: 767px)", () => {
        gsap.from("[data-preview-mobile]", {
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
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
    <div ref={sectionRef} className="bg-secondary/20">

      {/* Desktop: pinned */}
      <div className="hidden md:flex min-h-screen flex-col justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">Real Product</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium mb-6">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Not a concept. A real platform built for serious photographers.</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            {previewPanels.map((panel, index) => (
              <button
                key={panel.title}
                onClick={() => setActivePanel(index)}
                className={`px-6 py-3 rounded-full text-sm transition-all duration-300 ${
                  index === activePanel ? "bg-foreground text-background font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {panel.title}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
            {/* Dashboard */}
            <div className={`absolute inset-0 p-6 transition-all duration-700 ${activePanel === 0 ? "opacity-100 scale-100" : "opacity-0 scale-[0.97] pointer-events-none"}`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-foreground/10" />
                    <div>
                      <p className="font-medium">Welcome back, Alex</p>
                      <p className="text-sm text-muted-foreground">Professional Photographer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-serif">$12,847</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[{ l: "Photos", v: "156" }, { l: "Sales", v: "89" }, { l: "Views", v: "24.5K" }, { l: "Followers", v: "1.2K" }].map((s) => (
                    <div key={s.l} className="bg-secondary/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-medium">{s.v}</p>
                      <p className="text-sm text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-5 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-secondary rounded-lg" style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-${["1506905925346-21bda4d32df4","1469474968028-56623f02e42e","1426604966848-d7adac402bff","1472214103451-9374bd1c798e","1470071459604-3b5ec3a7fe05","1441974231531-c6227db76b6e","1518173946687-a4c8892bbd9f","1475924156734-496f6cac6ec1","1507400492013-162706c8c05e","1519681393784-d120267933ba"][i]}?w=200&h=200&fit=crop')`,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Detail */}
            <div className={`absolute inset-0 p-6 transition-all duration-700 ${activePanel === 1 ? "opacity-100 scale-100" : "opacity-0 scale-[0.97] pointer-events-none"}`}>
              <div className="h-full flex gap-6">
                <div className="flex-1 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-secondary" style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&fit=crop')`,
                    backgroundSize: "cover", backgroundPosition: "center",
                  }} />
                </div>
                <div className="w-80 space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Mountain Sunrise</h3>
                    <p className="text-muted-foreground text-sm">Captured at dawn in the Swiss Alps. Golden hour light illuminating the peaks.</p>
                  </div>
                  <div className="space-y-3">
                    {[["Standard", "$29"], ["Extended", "$99"], ["Exclusive", "$499"]].map(([t, p]) => (
                      <div key={t} className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t}</span>
                        <span className="font-medium">{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>47 views</span><span>12 favorites</span><span>3 sales</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className={`absolute inset-0 p-6 transition-all duration-700 ${activePanel === 2 ? "opacity-100 scale-100" : "opacity-0 scale-[0.97] pointer-events-none"}`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-medium">Earnings Analytics</h3>
                  <div className="flex gap-2">
                    {["7D", "30D", "90D", "1Y"].map((p, i) => (
                      <button key={p} className={`px-3 py-1 rounded text-sm ${i === 1 ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>{p}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-2 pb-4 border-b border-border">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-foreground/20 rounded-t transition-all duration-500 hover:bg-foreground/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between pt-4 text-sm text-muted-foreground">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {previewPanels.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activePanel ? "w-8 bg-foreground" : i < activePanel ? "w-4 bg-foreground/30" : "w-4 bg-foreground/10"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden py-20 px-6">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl font-medium mb-2">See It In Action</h2>
          <p className="text-sm text-muted-foreground">A real platform for serious photographers.</p>
        </div>
        <div className="space-y-4 max-w-sm mx-auto">
          {["Dashboard", "Photo Detail", "Earnings"].map((title) => (
            <div key={title} data-preview-mobile className="rounded-xl border bg-card p-4">
              <p className="text-sm font-medium mb-2">{title}</p>
              <div className="aspect-video rounded-lg bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
