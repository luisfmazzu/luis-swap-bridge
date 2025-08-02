"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function SupportedNetworks() {
  const networks = [
    {
      name: "Ethereum",
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      name: "Polygon",
      logo: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      name: "Arbitrum",
      logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg",
      color: "from-cyan-500/20 to-cyan-600/10",
    },
    {
      name: "Optimism",
      logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg",
      color: "from-red-500/20 to-red-600/10",
    },
    {
      name: "Base",
      logo: "https://github.com/base-org/brand-kit/raw/main/logo/in-product/Base_Network_Logo.svg",
      color: "from-blue-600/20 to-blue-700/10",
    },
    {
      name: "Avalanche",
      logo: "https://cryptologos.cc/logos/avalanche-avax-logo.svg",
      color: "from-red-600/20 to-red-700/10",
    },
    {
      name: "BSC",
      logo: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
      color: "from-yellow-500/20 to-yellow-600/10",
    },
    {
      name: "Solana",
      logo: "https://cryptologos.cc/logos/solana-sol-logo.svg",
      color: "from-green-500/20 to-green-600/10",
    },
  ]

  return (
    <section
      className="self-stretch py-12 sm:py-16 flex flex-col justify-center items-center gap-6 overflow-hidden"
      id="networks-section"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center text-gray-300 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mb-4 px-4"
      >
        Available on
      </motion.div>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6 lg:gap-8 justify-items-center">
          {networks.map((network, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className="group relative overflow-hidden rounded-2xl w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] xl:max-w-[180px] 2xl:max-w-[160px] cursor-pointer"
            >
              {/* Standard Background 1 - matching Why Choose LuiSwap */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "rgba(231, 236, 235, 0.08)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                }}
              />

              {/* Border */}
              <div className="absolute inset-0 border border-white/20 rounded-2xl" />

              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${network.color} opacity-0 group-hover:opacity-60 transition-all duration-500 rounded-2xl`}
              />

              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />

              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl" />

              {/* Content */}
              <div className="relative z-10 p-3 sm:p-4 md:p-6 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 h-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                {/* Logo container with floating animation */}
                <motion.div
                  className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex items-center justify-center"
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                >
                  {/* Logo glow effect */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150" />

                  <Image
                    src={network.logo || "/placeholder.svg"}
                    alt={`${network.name} Logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain filter grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 relative z-10"
                  />
                </motion.div>

                {/* Network name with enhanced typography */}
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300 tracking-wide">
                    {network.name}
                  </span>

                  {/* Animated underline */}
                  <div className="h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 mt-1" />
                </div>
              </div>

              {/* Floating particles effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full"
                    style={{
                      left: `${20 + index * 30}%`,
                      top: `${30 + index * 20}%`,
                    }}
                    animate={{
                      y: [-10, -20, -10],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2 + index * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
