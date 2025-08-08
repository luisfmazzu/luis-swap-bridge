"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { usePortfolio, usePortfolioHistory } from "@/hooks/use-portfolio"
import { useAccount } from "wagmi"
import { useAuth } from "@/contexts/auth-provider"

export function PortfolioOverview() {
  // Try to get wagmi connection, fallback to auth provider
  let isConnected = false
  try {
    const wagmiAccount = useAccount()
    isConnected = wagmiAccount.isConnected
  } catch (error) {
    // Wagmi not available, fallback to auth provider
    console.debug('Wagmi not available, using auth provider')
  }
  
  // Also check for Turnkey authentication
  const { state } = useAuth()
  const { user: turnkeyUser } = state
  const hasTurnkeyAuth = !!turnkeyUser
  
  // Consider connected if either wagmi is connected OR user is authenticated with Turnkey
  const effectivelyConnected = isConnected || hasTurnkeyAuth
  const { data: portfolio, isLoading: isLoadingPortfolio } = usePortfolio()
  const { data: history, isLoading: isLoadingHistory } = usePortfolioHistory(7)

  if (!effectivelyConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your portfolio across all supported chains.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoadingPortfolio || isLoadingHistory) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-muted/50 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-muted/50 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted/50 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!portfolio || portfolio.totalTokens === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Tokens Found</h3>
          <p className="text-muted-foreground">
            No tokens found in your wallet across supported chains.
          </p>
        </CardContent>
      </Card>
    )
  }

  const lastValue = history && history.length > 1 ? history[history.length - 2].totalValue : portfolio.totalUsdValue
  const change24h = portfolio.totalUsdValue - lastValue
  const changePercent = lastValue > 0 ? ((change24h / lastValue) * 100) : 0
  const isPositive = change24h >= 0

  return (
    <div className="space-y-6">
      {/* Total Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  ${portfolio.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {isPositive ? '+' : ''}${Math.abs(change24h).toFixed(2)} ({changePercent.toFixed(2)}%)
                  </span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
              <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {changePercent.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Portfolio Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{portfolio.totalTokens}</div>
            <div className="text-sm text-muted-foreground">Total Tokens</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{portfolio.chainBreakdown.length}</div>
            <div className="text-sm text-muted-foreground">Active Chains</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              ${(portfolio.totalUsdValue / portfolio.totalTokens).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Token Value</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chain Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Portfolio by Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.chainBreakdown.map((chain, index) => {
                const percentage = (chain.usdValue / portfolio.totalUsdValue) * 100
                return (
                  <div key={chain.chainId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground">{chain.chainName}</div>
                        <Badge variant="outline" className="text-xs">
                          {chain.tokenCount} token{chain.tokenCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        ${chain.usdValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}