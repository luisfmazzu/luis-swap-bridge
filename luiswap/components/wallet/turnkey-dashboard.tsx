'use client'

import { TurnkeyWalletCard } from './turnkey-wallet-card'
import { TurnkeyAssets } from './turnkey-assets'
import { TurnkeyActivity } from './turnkey-activity'

interface TurnkeyDashboardProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum'
}

export function TurnkeyDashboard({ className, selectedNetwork }: TurnkeyDashboardProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Wallet Overview Card */}
      <TurnkeyWalletCard selectedNetwork={selectedNetwork} />
      
      <div className="grid gap-6 md:grid-cols-1">
        {/* Assets Section */}
        <TurnkeyAssets selectedNetwork={selectedNetwork} />
        
        {/* Activity Section */}
        <TurnkeyActivity selectedNetwork={selectedNetwork} />
      </div>
    </div>
  )
}