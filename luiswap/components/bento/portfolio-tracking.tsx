import type React from "react"

interface PortfolioTrackingProps {
  className?: string
}

const PortfolioTracking: React.FC<PortfolioTrackingProps> = ({ className = "" }) => {
  const portfolioData = [
    { token: "USDC", amount: "5,234.56", value: "$5,234.56", change: "+2.4%" },
    { token: "USDT", amount: "3,187.43", value: "$3,187.43", change: "+1.8%" },
    { token: "DAI", amount: "1,876.21", value: "$1,876.21", change: "+0.9%" },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Portfolio tracking interface showing token balances and performance"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "320px",
          height: "240px",
          background: "linear-gradient(180deg, hsl(var(--card)) 0%, transparent 100%)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        <div className="p-4 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Portfolio</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">$10,298.20</div>
              <div className="text-xs text-green-400">+$124.56 (1.2%)</div>
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-3">
            {portfolioData.map((item, index) => (
              <div key={item.token} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">{item.token.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.token}</div>
                    <div className="text-xs text-muted-foreground">{item.amount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-foreground">{item.value}</div>
                  <div className="text-xs text-green-400">{item.change}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="mt-4 h-8 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded opacity-60" />
        </div>
      </div>
    </div>
  )
}

export default PortfolioTracking
