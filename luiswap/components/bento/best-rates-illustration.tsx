import type React from "react"

interface BestRatesIllustrationProps {
  className?: string
}

const BestRatesIllustration: React.FC<BestRatesIllustrationProps> = ({ className = "" }) => {
  const exchanges = [
    { name: "Uniswap", rate: "0.9998", color: "text-pink-400" },
    { name: "1inch", rate: "0.9995", color: "text-blue-400" },
    { name: "SushiSwap", rate: "0.9992", color: "text-purple-400" },
    { name: "LuiSwap", rate: "1.0001", color: "text-green-400", best: true },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Best rates comparison showing LuiSwap with the highest rate"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "linear-gradient(180deg, hsl(var(--card)) 0%, transparent 100%)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        <div className="p-4 h-full flex flex-col justify-center">
          <h3 className="text-base font-semibold text-foreground mb-4 text-center">Rate Comparison</h3>
          <div className="space-y-3">
            {exchanges.map((exchange, index) => (
              <div
                key={exchange.name}
                className={`flex items-center justify-between p-2.5 rounded-lg ${
                  exchange.best ? "bg-primary/20 border border-primary/30" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${exchange.best ? "bg-primary" : "bg-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${exchange.color}`}>{exchange.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{exchange.rate}</span>
                  {exchange.best && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Best</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BestRatesIllustration
