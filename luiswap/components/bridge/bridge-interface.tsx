"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Settings, Loader2 } from "lucide-react"
import { BridgeTokenSelector } from "./bridge-token-selector"
import { ChainSelector } from "./chain-selector"
import { BridgeSelector } from "./bridge-selector"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useBridgeQuote } from "@/hooks/use-bridge"
import { useAccount, useChainId } from "wagmi"
import { parseUnits } from "viem"
import { getBridgeTokensByChain } from "@/lib/constants/tokens"
import { getChainName } from "@/lib/constants/chains"
import type { Token } from "@/lib/constants/tokens"
import type { BridgeRoute } from "@/lib/api/bridge"

export function BridgeInterface() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [fromAmount, setFromAmount] = useState("")
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromChainId, setFromChainId] = useState(chainId)
  const [toChainId, setToChainId] = useState(137) // Polygon as default
  const [selectedRoute, setSelectedRoute] = useState<BridgeRoute | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const { balance: fromTokenBalance } = useTokenBalance({
    address,
    token: fromToken,
    enabled: isConnected && !!fromToken
  })
  const { balance: toTokenBalance } = useTokenBalance({
    address,
    token: toToken,
    enabled: isConnected && !!toToken
  })

  const fromChainTokens = getBridgeTokensByChain(fromChainId)
  const toChainTokens = getBridgeTokensByChain(toChainId)

  const { 
    routes, 
    isLoading: isLoadingRoutes, 
    executeBridge 
  } = useBridgeQuote({
    fromToken,
    toToken,
    fromChainId,
    toChainId,
    amount: fromAmount ? parseUnits(fromAmount, fromToken?.decimals || 18) : 0n,
    enabled: !!(fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0)
  })

  useEffect(() => {
    // Reset from token when chain changes or set default if none selected
    if (fromChainTokens.length > 0) {
      const currentTokenInChain = fromChainTokens.find(t => t.address === fromToken?.address && t.chainId === fromChainId)
      if (!currentTokenInChain) {
        setFromToken(fromChainTokens[0]) // Default to first available token (USDC or USDT)
      }
    } else {
      setFromToken(null)
    }
  }, [fromChainId, fromChainTokens])

  useEffect(() => {
    // Reset to token when chain changes or set default if none selected
    if (toChainTokens.length > 0) {
      const currentTokenInChain = toChainTokens.find(t => t.address === toToken?.address && t.chainId === toChainId)
      if (!currentTokenInChain) {
        setToToken(toChainTokens[0]) // Default to first available token (USDC or USDT)
      }
    } else {
      setToToken(null)
    }
  }, [toChainId, toChainTokens])

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      const recommended = routes.find(route => route.isRecommended) || routes[0]
      setSelectedRoute(recommended)
    }
  }, [routes, selectedRoute])

  const handleSwapChains = () => {
    const tempChainId = fromChainId
    const tempToken = fromToken
    
    setFromChainId(toChainId)
    setToChainId(tempChainId)
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount("")
    setSelectedRoute(null)
  }

  const handleExecuteBridge = async () => {
    if (!selectedRoute || !address || !fromToken || !toToken) return

    try {
      setIsExecuting(true)
      await executeBridge(selectedRoute, address)
    } catch (error) {
      console.error("Bridge execution failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getFromChainName = () => {
    return getChainName(fromChainId)
  }

  const getToChainName = () => {
    return getChainName(toChainId)
  }

  const canExecute = isConnected && selectedRoute && fromAmount && parseFloat(fromAmount) > 0 && 
                    fromTokenBalance && fromTokenBalance.value >= parseUnits(fromAmount, fromToken?.decimals || 18)

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        className="max-w-md mx-auto"
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center justify-between mb-4 sm:mb-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">Bridge</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {getFromChainName()} → {getToChainName()}
                  </p>
                </div>
                <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>

              <div className="space-y-3 sm:space-y-4">
                {/* From Chain Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium">From</label>
                  <ChainSelector
                    selectedChainId={fromChainId}
                    onChainSelect={setFromChainId}
                    excludeChainId={toChainId}
                  />
                </motion.div>

                {/* From Token */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium">Amount ({getFromChainName()})</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="flex-1 h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <BridgeTokenSelector
                      selectedToken={fromToken}
                      onTokenSelect={setFromToken}
                      chainId={fromChainId}
                    />
                  </div>
                  {fromTokenBalance && (
                    <div className="text-xs text-muted-foreground px-1">
                      Balance: {fromTokenBalance.formatted} {fromToken?.symbol}
                      {fromTokenBalance.usdValue && (
                        <span className="ml-1">(${fromTokenBalance.usdValue})</span>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Swap Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="flex justify-center py-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSwapChains}
                      className="h-10 w-10 rounded-full border border-border hover:bg-accent"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>

                {/* To Chain Selection */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium">To</label>
                  <ChainSelector
                    selectedChainId={toChainId}
                    onChainSelect={setToChainId}
                    excludeChainId={fromChainId}
                  />
                </motion.div>

                {/* To Token */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium">Receive ({getToChainName()})</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={selectedRoute ? selectedRoute.toAmount : ""}
                      readOnly
                      className="flex-1 h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <BridgeTokenSelector
                      selectedToken={toToken}
                      onTokenSelect={setToToken}
                      chainId={toChainId}
                    />
                  </div>
                  {toTokenBalance && (
                    <div className="text-xs text-muted-foreground px-1">
                      Balance: {toTokenBalance.formatted} {toToken?.symbol}
                      {toTokenBalance.usdValue && (
                        <span className="ml-1">(${toTokenBalance.usdValue})</span>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bridge Routes */}
      {fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-foreground px-1">Bridge Routes</h3>
            <BridgeSelector
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              isLoading={isLoadingRoutes}
            />
          </div>
        </motion.div>
      )}

      {/* Execute Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="max-w-md mx-auto"
      >
        <Button 
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
          onClick={handleExecuteBridge}
          disabled={!canExecute || isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bridging...
            </>
          ) : !isConnected ? (
            "Connect Wallet"
          ) : !selectedRoute ? (
            "Select Route"
          ) : (
            "Bridge Tokens"
          )}
        </Button>
      </motion.div>
    </div>
  )
}