import type React from "react"

interface CrossChainIllustrationProps {
  className?: string
}

const CrossChainIllustration: React.FC<CrossChainIllustrationProps> = ({ className = "" }) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Cross-chain swap illustration showing tokens moving between networks"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "220px",
          background: "linear-gradient(180deg, hsl(var(--card)) 0%, transparent 100%)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        <div className="p-6 h-full flex items-center justify-between">
          {/* Source Chain */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-lg">ETH</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">1,000 USDC</div>
              <div className="text-xs text-muted-foreground">Ethereum</div>
            </div>
          </div>

          {/* Arrow with animation */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
              <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-700" />
            </div>
            <span className="text-xs text-primary font-medium">Swapping...</span>
          </div>

          {/* Destination Chain */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-bold text-lg">POLY</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">999.85 USDT</div>
              <div className="text-xs text-muted-foreground">Polygon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrossChainIllustration
