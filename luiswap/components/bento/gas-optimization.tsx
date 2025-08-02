import type React from "react"

interface GasOptimizationProps {
  className?: string
}

const GasOptimization: React.FC<GasOptimizationProps> = ({ className = "" }) => {
  const gasComparison = [
    { method: "Direct Swap", gas: "$45.20", color: "text-red-400" },
    { method: "Standard DEX", gas: "$32.80", color: "text-yellow-400" },
    { method: "LuiSwap", gas: "$12.50", color: "text-green-400", savings: "72%" },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Gas optimization showing cost savings compared to other methods"
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
        <div className="p-6 h-full flex flex-col justify-center">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">⛽</div>
            <h3 className="text-lg font-semibold text-foreground">Gas Optimization</h3>
          </div>

          <div className="space-y-3">
            {gasComparison.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.color === "text-green-400"
                        ? "bg-green-400"
                        : item.color === "text-yellow-400"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                  />
                  <span className="text-sm text-foreground">{item.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${item.color}`}>{item.gas}</span>
                  {item.savings && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                      -{item.savings}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Smart routing saves you money on every trade
          </div>
        </div>
      </div>
    </div>
  )
}

export default GasOptimization
