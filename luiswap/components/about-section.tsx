import Image from "next/image"

export function AboutSection() {
  const teamMembers = [
    {
      name: "Luis Rodriguez",
      role: "Founder & CEO",
      avatar: "/images/avatars/annette-black.png",
      description: "Former Goldman Sachs trader with 10+ years in DeFi",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      avatar: "/images/avatars/dianne-russell.png",
      description: "Ex-Coinbase engineer, blockchain security expert",
    },
    {
      name: "Mike Thompson",
      role: "Head of Product",
      avatar: "/images/avatars/cameron-williamson.png",
      description: "Former Uniswap product lead, UX specialist",
    },
  ]

  const securityFeatures = [
    "Multi-signature smart contracts",
    "Real-time security monitoring",
    "Insurance coverage up to $10M",
    "Regular third-party audits",
  ]

  return (
    <section className="w-full px-5 py-16 flex flex-col justify-center items-center overflow-hidden" id="about-section">
      <div className="w-full max-w-6xl mx-auto space-y-16">
        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Built by DeFi Veterans</h2>
          <p className="text-muted-foreground text-lg mb-12">
            Our team combines traditional finance expertise with cutting-edge blockchain technology
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl">
                {/* Standard Background 2 - Blue gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl" />

                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl" />

                {/* Content */}
                <div className="relative z-10 p-6">
                  <Image
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Enterprise-Grade Security</h2>
          <p className="text-muted-foreground text-lg mb-12">
            Your funds are protected by industry-leading security measures
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl text-left">
                {/* Standard Background 2 - Blue gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl" />

                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl" />

                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
