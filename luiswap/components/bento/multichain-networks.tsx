import type React from "react"

interface MultichainNetworksProps {
  className?: string
}

const MultichainNetworks: React.FC<MultichainNetworksProps> = ({ className = "" }) => {
  const networks = [
    { name: "ETH", color: "bg-blue-500", position: { top: "20%", left: "20%" } },
    { name: "POLY", color: "bg-purple-500", position: { top: "20%", right: "20%" } },
    { name: "ARB", color: "bg-cyan-500", position: { top: "60%", left: "15%" } },
    { name: "OP", color: "bg-red-500", position: { top: "60%", right: "15%" } },
    { name: "BASE", color: "bg-blue-600", position: { bottom: "20%", left: "30%" } },
    { name: "AVAX", color: "bg-red-600", position: { bottom: "20%", right: "30%" } },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Multichain network illustration showing connected blockchain networks"
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
        <div className="relative w-full h-full p-4">
          {/* Central Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
            <span className="text-primary-foreground font-bold text-sm">HUB</span>
          </div>

          {/* Network Nodes */}
          {networks.map((network, index) => (
            <div key={network.name}>
              {/* Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={
                    network.position.left ? network.position.left : `${100 - Number.parseInt(network.position.right)}%`
                  }
                  y2={
                    network.position.top ? network.position.top : `${100 - Number.parseInt(network.position.bottom)}%`
                  }
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="2,4"
                />
              </svg>

              {/* Network Node */}
              <div
                className={`absolute w-10 h-10 rounded-full ${network.color} flex items-center justify-center z-10`}
                style={network.position}
              >
                <span className="text-white font-bold text-xs">{network.name}</span>
              </div>
            </div>
          ))}

          {/* Animated Pulse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 animate-ping" />
        </div>
      </div>
    </div>
  )
}

export default MultichainNetworks
