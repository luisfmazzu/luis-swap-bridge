"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Settings, Loader2 } from "lucide-react"
import { TokenSelector } from "@/components/swap/token-selector"
import { BridgeSelector } from "./bridge-selector"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useBridgeQuote } from "@/hooks/use-bridge"
import { useAccount, useChainId } from "wagmi"
import { parseUnits } from "viem"
import { SUPPORTED_CHAINS, getTokensByChain } from "@/lib/constants/tokens"
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

  const { balance: fromTokenBalance } = useTokenBalance(fromToken, address, fromChainId)
  const { balance: toTokenBalance } = useTokenBalance(toToken, address, toChainId)

  const fromChainTokens = getTokensByChain(fromChainId)
  const toChainTokens = getTokensByChain(toChainId)

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
    if (!fromToken && fromChainTokens.length > 0) {
      setFromToken(fromChainTokens[0])
    }
  }, [fromChainTokens, fromToken])

  useEffect(() => {
    if (!toToken && toChainTokens.length > 0) {
      setToToken(toChainTokens[0])
    }
  }, [toChainTokens, toToken])

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
    return SUPPORTED_CHAINS.find(chain => chain.id === fromChainId)?.name || "Unknown"
  }

  const getToChainName = () => {
    return SUPPORTED_CHAINS.find(chain => chain.id === toChainId)?.name || "Unknown"
  }

  const canExecute = isConnected && selectedRoute && fromAmount && parseFloat(fromAmount) > 0 && 
                    fromTokenBalance && fromTokenBalance.value >= parseUnits(fromAmount, fromToken?.decimals || 18)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Bridge</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getFromChainName()} → {getToChainName()}
                  </p>
                </div>
                <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>

              <div className="space-y-4">
                {/* From Token */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-muted-foreground">From ({getFromChainName()})</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="pr-32 text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <TokenSelector
                        tokens={fromChainTokens}
                        selectedToken={fromToken}
                        onSelectToken={setFromToken}
                        showBalance={true}
                        userAddress={address}
                        chainId={fromChainId}
                      />
                    </div>
                  </div>
                  {fromTokenBalance && (
                    <div className="text-xs text-muted-foreground">
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
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex justify-center"
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
                      className="rounded-full border border-border hover:bg-accent"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>

                {/* To Token */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm text-muted-foreground">To ({getToChainName()})</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={selectedRoute ? selectedRoute.toAmount : ""}
                      readOnly
                      className="pr-32 text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <TokenSelector
                        tokens={toChainTokens}
                        selectedToken={toToken}
                        onSelectToken={setToToken}
                        showBalance={true}
                        userAddress={address}
                        chainId={toChainId}
                      />
                    </div>
                  </div>
                  {toTokenBalance && (
                    <div className="text-xs text-muted-foreground">
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
        >
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Bridge Routes</h3>
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
      >
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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