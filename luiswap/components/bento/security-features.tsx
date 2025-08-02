import type React from "react"

interface SecurityFeaturesProps {
  className?: string
}

const SecurityFeatures: React.FC<SecurityFeaturesProps> = ({ className = "" }) => {
  const securityFeatures = [
    { icon: "🛡️", label: "Multi-sig", status: "Active" },
    { icon: "🔒", label: "Encryption", status: "256-bit" },
    { icon: "🔍", label: "Audited", status: "3 Firms" },
    { icon: "💰", label: "Insured", status: "$10M" },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="Security features showing various protection measures"
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
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="text-lg font-semibold text-foreground">Security Shield</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg mb-1">{feature.icon}</div>
                <div className="text-xs font-medium text-foreground">{feature.label}</div>
                <div className="text-xs text-green-400">{feature.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              All Systems Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityFeatures
