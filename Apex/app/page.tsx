import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { HowItWorks } from '@/components/HowItWorks'
import { Testimonials } from '@/components/Testimonials'
import { PricingPreview } from '@/components/PricingPreview'
import { CTA } from '@/components/CTA'
import { Stats } from '@/components/Stats'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <CTA />
    </>
  )
}
