"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const creators = [
  { name: "Sarah Chen", role: "Landscape Photographer", quote: "Finally, a platform that respects my work and my pricing.", earnings: "$8,420", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", photos: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&fit=crop" },
  { name: "Marcus Rivera", role: "Street Photographer", quote: "85% revenue share changed everything for me.", earnings: "$12,150", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", photos: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&fit=crop" },
  { name: "Emma Lindqvist", role: "Wildlife Photographer", quote: "No algorithm suppression. My best work actually gets seen.", earnings: "$15,890", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", photos: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&fit=crop" },
  { name: "James Okonkwo", role: "Portrait Photographer", quote: "Weekly payouts mean I can actually plan my finances.", earnings: "$9,730", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", photos: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&fit=crop" },
]

export function Creators() {
  const sectionRef = useRef<HTMLElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-creator]", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">Creator Stories</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium">Join Thousands of Creators</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, index) => (
            <div
              key={creator.name}
              data-creator
              className="group relative rounded-xl overflow-hidden border border-border bg-card"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="aspect-[4/5] bg-secondary transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${creator.photos}')`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent transition-opacity duration-300 ${hoveredCard === index ? "opacity-100" : "opacity-80"}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full border-2 border-background bg-secondary" style={{ backgroundImage: `url('${creator.image}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div>
                    <p className="font-medium">{creator.name}</p>
                    <p className="text-sm text-muted-foreground">{creator.role}</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-4 transition-all duration-300 ${hoveredCard === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  &quot;{creator.quote}&quot;
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Earned</span>
                  <span className="text-lg font-serif">{creator.earnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
