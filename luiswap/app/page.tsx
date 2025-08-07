import { HeroSection } from "@/components/hero-section"
import { SectionDivider } from "@/components/section-divider"
import { SupportedNetworks } from "@/components/supported-networks"
import { StatisticsSection } from "@/components/statistics-section"
import { BentoSection } from "@/components/bento-section"
import { AboutSection } from "@/components/about-section"
import { WhyItMattersSection } from "@/components/why-it-matters-section"
import { CTASection } from "@/components/cta-section"
import { FooterSection } from "@/components/footer-section"
import { AnimatedSection } from "@/components/animated-section"
import { OAuthHandler } from "@/components/oauth-handler"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden w-full">
      {/* OAuth Handler - processes OAuth callbacks */}
      <OAuthHandler />
      
      <div className="relative z-10 w-full">
        {/* Hero Section - Full Width with integrated DEX preview */}
        <HeroSection />

        {/* Section Divider - single unified divider */}
        <SectionDivider />

        {/* Supported Networks */}
        <div
          className="relative"
          style={{ background: "linear-gradient(to bottom, #22273d 0%, hsl(var(--background)) 100%)" }}
        >
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection className="relative z-10 px-6" delay={0.1}>
              <SupportedNetworks />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-background via-background to-primary/10">
          {/* Statistics Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection className="relative z-10" delay={0.2}>
              <StatisticsSection />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          {/* Bento Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection id="features-section" className="relative z-10" delay={0.2}>
              <BentoSection />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-background via-background to-primary/15">
          {/* About Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection id="about-section" className="relative z-10" delay={0.2}>
              <AboutSection />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-primary/15 via-primary/8 to-background">
          {/* Why It Matters Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection className="relative z-10" delay={0.2}>
              <WhyItMattersSection />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-background via-primary/5 to-primary/20">
          {/* CTA Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection className="relative z-10" delay={0.2}>
              <CTASection />
            </AnimatedSection>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-primary/20 via-primary/10 to-background">
          {/* Footer Section */}
          <div className="max-w-[1320px] mx-auto">
            <AnimatedSection className="relative z-10" delay={0.2}>
              <FooterSection />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
