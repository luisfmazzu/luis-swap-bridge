'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"
import { DynamicPortfolioOverview } from "@/components/web3"
import { TokenList } from "@/components/portfolio/token-list"
import { TurnkeyDashboard } from "@/components/wallet/turnkey-dashboard"
import { useAuth } from "@/contexts/auth-provider"
import { useActiveWallet } from "@/lib/stores/wallet-store"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, AlertCircle } from "lucide-react"

export default function ExplorePage() {
  const { user: turnkeyUser } = useAuth()
  const activeWallet = useActiveWallet()
  const [walletType, setWalletType] = useState<'turnkey' | 'wagmi' | 'none'>('none')

  // Determine which wallet is active
  useEffect(() => {
    if (turnkeyUser) {
      console.log('🔄 ExplorePage: Turnkey user detected:', turnkeyUser.email)
      setWalletType('turnkey')
    } else if (activeWallet?.isConnected) {
      console.log('🔄 ExplorePage: Wagmi wallet detected:', activeWallet.type)
      setWalletType('wagmi')
    } else {
      console.log('🔄 ExplorePage: No wallet connected')
      setWalletType('none')
    }
  }, [turnkeyUser, activeWallet])

  const renderDashboard = () => {
    switch (walletType) {
      case 'turnkey':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Turnkey Wallet Dashboard</h1>
              <p className="text-muted-foreground">
                Your embedded wallet powered by Turnkey
              </p>
            </div>
            <TurnkeyDashboard />
          </div>
        )

      case 'wagmi':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Portfolio Overview</h1>
              <p className="text-muted-foreground">
                Your connected wallet portfolio
              </p>
            </div>
            <DynamicPortfolioOverview />
            <TokenList />
          </div>
        )

      default:
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-muted p-3">
                    <Wallet className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">No Wallet Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect a wallet or authenticate with Turnkey to view your portfolio
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>Use the Connect Wallet button in the header</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {renderDashboard()}
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  )
}
