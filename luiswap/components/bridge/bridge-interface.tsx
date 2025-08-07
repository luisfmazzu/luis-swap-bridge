"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpDown, Settings, Loader2 } from "lucide-react"
import { BridgeTokenSelector } from "./bridge-token-selector"
import { ChainSelector } from "./chain-selector"
import { BridgeSelector } from "./bridge-selector"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useWalletTokens } from "@/hooks/use-wallet-tokens"
import { useTurnkeyWallet } from "@/hooks/use-turnkey-wallet"
import { useBridgeQuote } from "@/hooks/use-bridge"
import { useAccount, useChainId } from "wagmi"
import { useAuth } from "@/contexts/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner"
import { parseUnits } from "viem"
import { getBridgeTokensByChain } from "@/lib/constants/tokens"
import { getChainName, tronTestnet, celoTestnet } from "@/lib/constants/chains"
import type { Token } from "@/lib/constants/tokens"
import type { BridgeRoute } from "@/lib/api/bridge"

export function BridgeInterface() {
  const { address, isConnected } = useAccount()
  const { user: turnkeyUser } = useAuth()
  const { toast } = useToast()
  const chainId = 3448148188 // Tron testnet as default
  
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromChainId, setFromChainId] = useState(chainId)
  const [toChainId, setToChainId] = useState(44787) // Celo testnet as default
  const [selectedRoute, setSelectedRoute] = useState<BridgeRoute | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Handle fromAmount changes - automatically update toAmount to 98% of fromAmount
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      const calculatedToAmount = (parseFloat(value) * 0.98).toString()
      setToAmount(calculatedToAmount)
    } else {
      setToAmount("")
    }
  }

  // Handle toAmount changes - automatically update fromAmount so toAmount is 98% of fromAmount
  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      // If toAmount should be 98% of fromAmount, then fromAmount = toAmount / 0.98
      const calculatedFromAmount = (parseFloat(value) / 0.98).toString()
      setFromAmount(calculatedFromAmount)
    } else {
      setFromAmount("")
    }
  }

  // Check if Turnkey is connected
  const isTurnkeyConnected = !!turnkeyUser
  
  // Get Turnkey wallet info and tokens for each network
  const { walletInfo: tronWallet } = useTurnkeyWallet('tron')
  const { walletInfo: celoWallet } = useTurnkeyWallet('celo')
  
  const { tokens: tronTokens, pricesLoading: tronPricesLoading } = useWalletTokens(
    isTurnkeyConnected ? tronWallet?.address : undefined,
    'tron'
  )
  const { tokens: celoTokens, pricesLoading: celoPricesLoading } = useWalletTokens(
    isTurnkeyConnected ? celoWallet?.address : undefined,
    'celo'
  )

  // Get wagmi token balances (will be 0 for wagmi since this only works with Turnkey)
  const { balance: fromTokenBalance } = useTokenBalance({
    address,
    token: fromToken,
    enabled: isConnected && !!fromToken && !isTurnkeyConnected // Only use wagmi when not using Turnkey
  })
  const { balance: toTokenBalance } = useTokenBalance({
    address,
    token: toToken,
    enabled: isConnected && !!toToken && !isTurnkeyConnected // Only use wagmi when not using Turnkey
  })

  // Get the correct balance based on connection type
  const getEffectiveBalance = (token: Token | null, isFromToken: boolean) => {
    if (!token) return null
    
    if (isTurnkeyConnected) {
      // Get balance from Turnkey wallet tokens
      const networkMap: Record<number, 'tron' | 'celo'> = {
        3448148188: 'tron', // Tron testnet
        44787: 'celo'  // Celo testnet
      }
      const network = networkMap[isFromToken ? fromChainId : toChainId]
      const tokens = network === 'tron' ? tronTokens : celoTokens
      
      const matchingToken = tokens.find(t => 
        t.symbol.toLowerCase() === token.symbol.toLowerCase()
      )
      
      if (matchingToken) {
        return {
          formatted: matchingToken.balance,
          value: matchingToken.rawBalance,
          symbol: matchingToken.symbol,
          usdValue: matchingToken.valueUSD === -1 ? 'loading' : matchingToken.valueUSD.toString()
        }
      } else {
        // Token not found, return 0 balance
        return {
          formatted: '0',
          value: 0n,
          symbol: token.symbol,
          usdValue: '0'
        }
      }
    }
    
    // Return wagmi balance when not using Turnkey
    return isFromToken ? fromTokenBalance : toTokenBalance
  }

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
    setToAmount("")
    setSelectedRoute(null)
  }

  const handleExecuteBridge = async () => {
    if (!fromToken || !toToken) {
      return
    }

    try {
      setIsExecuting(true)
      
      // Mock transfer - simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success toast using Sonner
      sonnerToast.success("Transfer successful!", {
        description: `Successfully bridged ${fromAmount} ${fromToken.symbol} from ${getFromChainName()} to ${getToChainName()}`,
        duration: 5000,
      })
      
      // Reset form
      setFromAmount("")
      setToAmount("")
      setSelectedRoute(null)
      
    } catch (error) {
      sonnerToast.error("Transfer failed", {
        description: "Something went wrong with the transfer",
        duration: 5000,
      })
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

  const effectiveFromBalance = getEffectiveBalance(fromToken, true)
  const effectiveToBalance = getEffectiveBalance(toToken, false)
  
  const isWalletConnected = isConnected || isTurnkeyConnected
  const canExecute = isWalletConnected && fromAmount && parseFloat(fromAmount) > 0 && 
                    effectiveFromBalance && effectiveFromBalance.value >= parseUnits(fromAmount, fromToken?.decimals || 18)

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
                  className="space-y-2 mb-4"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium mr-2">From</label>
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
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="flex-1 h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <BridgeTokenSelector
                      selectedToken={fromToken}
                      onTokenSelect={setFromToken}
                      chainId={fromChainId}
                    />
                  </div>
                  {effectiveFromBalance && (
                    <div className="text-xs text-muted-foreground px-1">
                      Balance: {effectiveFromBalance.formatted} {fromToken?.symbol}
                      {effectiveFromBalance.usdValue === 'loading' ? (
                        <span className="ml-1">
                          (<Skeleton className="inline-block h-3 w-8" />)
                        </span>
                      ) : effectiveFromBalance.usdValue && effectiveFromBalance.usdValue !== '0' ? (
                        <span className="ml-1">(${effectiveFromBalance.usdValue})</span>
                      ) : null}
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
                  className="space-y-2 mb-4"
                >
                  <label className="text-xs sm:text-sm text-muted-foreground font-medium mr-2">To</label>
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
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      className="flex-1 h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground"
                    />
                    <BridgeTokenSelector
                      selectedToken={toToken}
                      onTokenSelect={setToToken}
                      chainId={toChainId}
                    />
                  </div>
                  {effectiveToBalance && (
                    <div className="text-xs text-muted-foreground px-1">
                      Balance: {effectiveToBalance.formatted} {toToken?.symbol}
                      {effectiveToBalance.usdValue === 'loading' ? (
                        <span className="ml-1">
                          (<Skeleton className="inline-block h-3 w-8" />)
                        </span>
                      ) : effectiveToBalance.usdValue && effectiveToBalance.usdValue !== '0' ? (
                        <span className="ml-1">(${effectiveToBalance.usdValue})</span>
                      ) : null}
                    </div>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bridge Routes - HIDDEN FOR NOW */}
      {/* {fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && (
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
      )} */}

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
              Processing...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet"
          ) : !fromAmount || parseFloat(fromAmount) === 0 ? (
            "Enter Amount"
          ) : (
            "Transfer"
          )}
        </Button>
      </motion.div>
    </div>
  )
}