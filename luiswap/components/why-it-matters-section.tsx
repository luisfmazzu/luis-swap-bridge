export function WhyItMattersSection() {
  const problems = [
    {
      title: "Fragmented Liquidity",
      description: "Assets scattered across multiple chains with poor connectivity",
      icon: "🔗",
    },
    {
      title: "High Fees & Slippage",
      description: "Expensive transactions and poor execution prices",
      icon: "💸",
    },
    {
      title: "Complex UX",
      description: "Difficult to navigate multiple protocols and bridges",
      icon: "🤯",
    },
    {
      title: "Security Risks",
      description: "Bridge hacks and smart contract vulnerabilities",
      icon: "⚠️",
    },
  ]

  const solutions = [
    {
      title: "Unified Liquidity",
      description: "Access aggregated liquidity from all major DEXs in one place",
      icon: "🌊",
    },
    {
      title: "Best Execution",
      description: "Optimized routing ensures best rates with minimal slippage",
      icon: "🎯",
    },
    {
      title: "Simple Interface",
      description: "One-click swaps across any supported blockchain network",
      icon: "✨",
    },
    {
      title: "Maximum Security",
      description: "Battle-tested smart contracts with comprehensive insurance",
      icon: "🛡️",
    },
  ]

  return (
    <section className="w-full px-5 py-16 flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Why It Matters</h2>
          <p className="text-muted-foreground text-lg">Solving the biggest challenges in multichain DeFi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Problems */}
          <div>
            <h3 className="text-2xl font-semibold text-red-400 mb-8 text-center">The Problems</h3>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl p-6">
                  {/* Standard Background 1 - matching Why Choose LuiSwap */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "rgba(231, 236, 235, 0.08)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }}
                  />

                  {/* Border */}
                  <div className="absolute inset-0 border border-white/20 rounded-xl" />

                  {/* Color accent overlay for problems (red) and solutions (primary) */}
                  <div className="absolute inset-0 bg-red-500/10 rounded-xl" />
                  <div className="absolute inset-0 border border-red-500/20 rounded-xl" />

                  {/* Content */}
                  <div className="relative z-10 flex items-start gap-4">
                    <span className="text-2xl">{problem.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h4>
                      <p className="text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-8 text-center">Our Solutions</h3>
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl p-6">
                  {/* Standard Background 1 - matching Why Choose LuiSwap */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "rgba(231, 236, 235, 0.08)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }}
                  />

                  {/* Border */}
                  <div className="absolute inset-0 border border-white/20 rounded-xl" />

                  {/* Color accent overlay for problems (red) and solutions (primary) */}
                  <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                  <div className="absolute inset-0 border border-primary/20 rounded-xl" />

                  {/* Content */}
                  <div className="relative z-10 flex items-start gap-4">
                    <span className="text-2xl">{solution.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">{solution.title}</h4>
                      <p className="text-muted-foreground">{solution.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
