import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ProductPreview } from "@/components/landing/product-preview"
import { Differentiation } from "@/components/landing/differentiation"
import { Creators } from "@/components/landing/creators"
import { Features } from "@/components/landing/features"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <ProductPreview />
      <Differentiation />
      <section id="creators">
        <Creators />
      </section>
      <section id="features">
        <Features />
      </section>
      <FinalCTA />
      <Footer />
    </main>
  )
}