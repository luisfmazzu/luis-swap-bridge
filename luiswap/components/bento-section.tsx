import BestRatesIllustration from "./bento/best-rates-illustration"
import CrossChainIllustration from "./bento/cross-chain-illustration"
import MultichainNetworks from "./bento/multichain-networks"
import PortfolioTracking from "./bento/portfolio-tracking"
import SecurityFeatures from "./bento/security-features"
import GasOptimization from "./bento/gas-optimization"

const BentoCard = ({ title, description, Component }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-4 sm:p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-base sm:text-lg lg:text-xl font-normal leading-6 sm:leading-7">
          {title} <br />
          <span className="text-muted-foreground text-sm sm:text-base lg:text-lg">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-60 sm:h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "Best rates guaranteed.",
      description: "Aggregated liquidity from multiple DEXs across chains.",
      Component: BestRatesIllustration,
    },
    {
      title: "Real-time cross-chain swaps",
      description: "Instant execution with optimized routing and MEV protection.",
      Component: CrossChainIllustration,
    },
    {
      title: "Multichain native",
      description: "Seamless experience across 10+ blockchain networks.",
      Component: MultichainNetworks,
    },
    {
      title: "Advanced portfolio tracking",
      description: "Monitor your assets and performance across all chains.",
      Component: PortfolioTracking,
    },
    {
      title: "Enterprise-grade security",
      description: "Institutional-level security with advanced risk management.",
      Component: SecurityFeatures,
    },
    {
      title: "Gas optimization",
      description: "Smart gas management to minimize transaction costs.",
      Component: GasOptimization,
    },
  ]

  return (
    <section
      className="w-full px-4 sm:px-5 flex flex-col justify-center items-center overflow-visible"
      id="features-section"
    >
      <div className="w-full py-6 sm:py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-6 sm:py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight md:leading-[66px] px-4">
              Why Choose LuiSwap
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed px-4">
              Experience the future of multichain DeFi with our comprehensive stablecoin trading platform designed for
              both beginners and professionals.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
