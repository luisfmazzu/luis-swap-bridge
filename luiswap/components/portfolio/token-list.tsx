"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAccount } from "wagmi"
import { SUPPORTED_CHAINS } from "@/lib/constants/tokens"

export function TokenList() {
  const { isConnected } = useAccount()
  const { data: portfolio, isLoading } = usePortfolio()

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to view your tokens.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/50 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted/50 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-muted/50 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted/50 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-muted/50 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portfolio || portfolio.totalTokens === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Your Tokens</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tokens found in your portfolio.</p>
        </CardContent>
      </Card>
    )
  }

  const getChainInfo = (chainId: number) => {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId)
  }

  const getExplorerUrl = (token: any, chainId: number) => {
    const chain = getChainInfo(chainId)
    if (!chain?.blockExplorers?.default?.url) return null
    
    return `${chain.blockExplorers.default.url}/token/${token.address}`
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Your Tokens ({portfolio.totalTokens})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {portfolio.tokens.map((portfolioToken, index) => {
            const { token, formattedBalance, usdValue, chainId, chainName } = portfolioToken
            const explorerUrl = getExplorerUrl(token, chainId)
            
            // Mock price change data (in a real app, this would come from the API)
            const priceChange = (Math.random() - 0.5) * 20
            const isPositive = priceChange >= 0

            return (
              <motion.div
                key={`${token.address}-${chainId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-4 rounded-lg border border-border hover:bg-muted/10 transition-colors"
              >
                {/* Desktop layout (> 600px) */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {getChainInfo(chainId)?.name.slice(0, 1) || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{token.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {chainName}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {formattedBalance} {token.symbol}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ${parseFloat(usdValue).toFixed(2)}
                      </span>
                      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                      {explorerUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 text-muted-foreground hover:text-primary"
                          onClick={() => window.open(explorerUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile layout (≤ 600px) - Two Column */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left Column - Token Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {token.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            {getChainInfo(chainId)?.name.slice(0, 1) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* Token symbol */}
                        <div className="font-medium text-foreground truncate">
                          {token.symbol}
                        </div>
                        {/* Chain name on separate row */}
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {chainName}
                          </Badge>
                        </div>
                        {/* Token name */}
                        <div className="text-sm text-muted-foreground mt-1 truncate">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Values */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium text-foreground">
                        {formattedBalance} {token.symbol}
                      </div>
                      {/* USD value */}
                      <div className="text-sm text-muted-foreground mt-1">
                        ${parseFloat(usdValue).toFixed(2)}
                      </div>
                      {/* Percentage change on separate row */}
                      <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </div>
                      {/* External link button */}
                      {explorerUrl && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-muted-foreground hover:text-primary"
                            onClick={() => window.open(explorerUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {portfolio.totalTokens > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Tokens
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}