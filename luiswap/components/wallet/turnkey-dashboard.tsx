'use client'

import { TurnkeyWalletCard } from './turnkey-wallet-card'
import { TurnkeyAssets } from './turnkey-assets'
import { TurnkeyActivity } from './turnkey-activity'

interface TurnkeyDashboardProps {
  className?: string
}

export function TurnkeyDashboard({ className }: TurnkeyDashboardProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Wallet Overview Card */}
      <TurnkeyWalletCard />
      
      <div className="grid gap-6 md:grid-cols-1">
        {/* Assets Section */}
        <TurnkeyAssets />
        
        {/* Activity Section */}
        <TurnkeyActivity />
      </div>
    </div>
  )
}