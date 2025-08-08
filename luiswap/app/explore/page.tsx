'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"
import { DynamicPortfolioOverview } from "@/components/web3"
import { TokenList } from "@/components/portfolio/token-list"
import { TurnkeyDashboard } from "@/components/wallet/turnkey-dashboard"
import { ExplorerButton } from "@/components/wallet/explorer-button"
import { useAuth } from "@/contexts/auth-provider"
import { useActiveWallet } from "@/lib/stores/wallet-store"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertCircle, Network } from "lucide-react"
import { NETWORK_CONFIGS } from "@/hooks/use-turnkey-wallet"

export default function ExplorePage() {
  const { state } = useAuth()
  const { user: turnkeyUser } = state
  const activeWallet = useActiveWallet()
  const [walletType, setWalletType] = useState<'turnkey' | 'wagmi' | 'none'>('none')
  const [selectedNetwork, setSelectedNetwork] = useState<'tron' | 'ethereum' | 'celo'>('tron')

  // Determine which wallet is active
  useEffect(() => {
    if (turnkeyUser) {
      setWalletType('turnkey')
    } else if (activeWallet?.isConnected) {
      setWalletType('wagmi')
    } else {
      setWalletType('none')
    }
  }, [turnkeyUser, activeWallet])

  const renderDashboard = () => {
    switch (walletType) {
      case 'turnkey':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Turnkey Wallet Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                Your embedded wallet powered by Turnkey
              </p>
              
              {/* Network Selector and Explorer Button Row */}
              <div className="w-full max-w-5xl mx-auto">
                {/* Desktop: Single row with justify-between */}
                <div className="hidden sm:flex items-center justify-between">
                  {/* Network Selector - Left aligned */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Network className="h-4 w-4" />
                      <span>Network:</span>
                    </div>
                    <Select 
                      value={selectedNetwork} 
                      onValueChange={(value: 'tron' | 'ethereum' | 'celo') => setSelectedNetwork(value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(NETWORK_CONFIGS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  config.id === 'tron' 
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                    : config.id === 'celo'
                                    ? 'bg-gradient-to-r from-green-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                }`}
                              />
                              <span>{config.name}</span>
                              <Badge variant="outline" className="text-xs ml-1">
                                {config.testnet}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Explorer Button - Right aligned */}
                  <div className="flex items-center">
                    <ExplorerButton selectedNetwork={selectedNetwork} />
                  </div>
                </div>

                {/* Mobile: Stack vertically for small screens */}
                <div className="sm:hidden space-y-4">
                  {/* Network Selector */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Network className="h-4 w-4" />
                      <span>Network:</span>
                    </div>
                    <Select 
                      value={selectedNetwork} 
                      onValueChange={(value: 'tron' | 'ethereum' | 'celo') => setSelectedNetwork(value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(NETWORK_CONFIGS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  config.id === 'tron' 
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                    : config.id === 'celo'
                                    ? 'bg-gradient-to-r from-green-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                }`}
                              />
                              <span>{config.name}</span>
                              <Badge variant="outline" className="text-xs ml-1">
                                {config.testnet}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Explorer Button */}
                  <div className="flex items-center justify-center">
                    <ExplorerButton selectedNetwork={selectedNetwork} />
                  </div>
                </div>
              </div>
            </div>
            <TurnkeyDashboard selectedNetwork={selectedNetwork} />
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-5xl mx-auto">
            {renderDashboard()}
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  )
}
