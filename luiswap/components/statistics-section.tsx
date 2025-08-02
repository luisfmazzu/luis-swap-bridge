"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function StatisticsSection() {
  const [stats, setStats] = useState({
    totalVolume: 2847392847,
    activeUsers: 45892,
    totalSavings: 12847392,
    transactions: 1847392,
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 100000),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10),
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 1000),
        transactions: prev.transactions + Math.floor(Math.random() * 50),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatCount = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toLocaleString()
  }

  const statisticsData = [
    {
      label: "Total Volume",
      value: formatNumber(stats.totalVolume),
      description: "Traded across all chains",
      color: "from-blue-500/30 to-cyan-500/20",
      iconColor: "text-blue-400",
      icon: "📊",
      glowColor: "shadow-blue-500/20",
    },
    {
      label: "Active Users",
      value: formatCount(stats.activeUsers),
      description: "Monthly active traders",
      color: "from-green-500/30 to-emerald-500/20",
      iconColor: "text-green-400",
      icon: "👥",
      glowColor: "shadow-green-500/20",
    },
    {
      label: "Total Savings",
      value: formatNumber(stats.totalSavings),
      description: "Saved in fees & slippage",
      color: "from-purple-500/30 to-pink-500/20",
      iconColor: "text-purple-400",
      icon: "💰",
      glowColor: "shadow-purple-500/20",
    },
    {
      label: "Transactions",
      value: formatCount(stats.transactions),
      description: "Cross-chain swaps completed",
      color: "from-yellow-500/30 to-orange-500/20",
      iconColor: "text-yellow-400",
      icon: "⚡",
      glowColor: "shadow-yellow-500/20",
    },
  ]

  return (
    <section className="w-full px-4 sm:px-5 py-12 sm:py-16 flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-4 px-4">
            Platform Statistics
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Real-time metrics from our multichain DEX platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {statisticsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              {/* Standard Background 2 - Blue gradient base */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl" />

              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl" />

              {/* Hover color overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-80 transition-all duration-500 rounded-2xl`}
              />

              {/* Animated glow effect */}
              <div
                className={`absolute inset-0 rounded-2xl ${stat.glowColor} shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl`}
              />

              {/* Inner highlight */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Content */}
              <div className="relative z-10 p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                {/* Icon with floating animation */}
                <motion.div
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  {stat.icon}
                </motion.div>

                {/* Value with counter animation */}
                <motion.div
                  key={stat.value}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold ${stat.iconColor} mb-2 tracking-tight`}
                >
                  {stat.value}
                </motion.div>

                {/* Label */}
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-gray-300 transition-colors duration-300">
                  {stat.description}
                </p>

                {/* Animated progress bar */}
                <div className="mt-3 sm:mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color.replace("/30", "/60").replace("/20", "/40")} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                  />
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(4)].map((_, particleIndex) => (
                  <motion.div
                    key={particleIndex}
                    className={`absolute w-1 h-1 ${stat.iconColor.replace("text-", "bg-")} rounded-full opacity-40`}
                    style={{
                      left: `${15 + particleIndex * 20}%`,
                      top: `${20 + particleIndex * 15}%`,
                    }}
                    animate={{
                      y: [-15, -25, -15],
                      x: [-5, 5, -5],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + particleIndex * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: particleIndex * 0.3,
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
