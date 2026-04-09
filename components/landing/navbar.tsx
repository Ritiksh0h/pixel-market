"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self) => {
          if (!headerRef.current) return
          if (self.scroll() > 50) {
            headerRef.current.classList.add("bg-background/80", "backdrop-blur-md", "border-b", "border-border")
            headerRef.current.classList.remove("bg-transparent")
          } else {
            headerRef.current.classList.remove("bg-background/80", "backdrop-blur-md", "border-b", "border-border")
            headerRef.current.classList.add("bg-transparent")
          }
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent"
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-medium">
          PixelMarket
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Creators</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Selling</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
