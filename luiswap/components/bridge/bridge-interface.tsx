"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Settings, Loader2 } from "lucide-react"
import { ChainSelector } from "./chain-selector"
import { useWalletConnection } from "@/contexts/unified-wallet-provider"
import { toast as sonnerToast } from "sonner"
import { getChainName } from "@/lib/constants/chains"
import { handleNumericInputChange } from "@/lib/input-validation"

// Hardcoded USDT token
const USDT_TOKEN = {
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
}

// localStorage keys for balances
const BALANCE_KEYS = {
  TRON_USDT: 'bridge_tron_usdt_balance',
  CELO_USDT: 'bridge_celo_usdt_balance'
}

// Initialize balances in localStorage
const initializeBalances = () => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(BALANCE_KEYS.TRON_USDT) === null) {
      localStorage.setItem(BALANCE_KEYS.TRON_USDT, '1000.000000')
    }
    if (localStorage.getItem(BALANCE_KEYS.CELO_USDT) === null) {
      localStorage.setItem(BALANCE_KEYS.CELO_USDT, '0.000000')
    }
  }
}

// Get balance from localStorage
const getBalance = (key: string): string => {
  if (typeof window === 'undefined') return '0.000000'
  return localStorage.getItem(key) || '0.000000'
}

// Set balance in localStorage
const setBalance = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

export function BridgeInterface() {
  const { isConnected, isInitializing } = useWalletConnection() // Using unified wallet state
  
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromChainId, setFromChainId] = useState(3448148188) // Tron testnet
  const [toChainId, setToChainId] = useState(44787) // Celo testnet
  const [isExecuting, setIsExecuting] = useState(false)
  const [tronBalance, setTronBalance] = useState("0.000000")
  const [celoBalance, setCeloBalance] = useState("0.000000")

  // Initialize balances on mount
  useEffect(() => {
    initializeBalances()
    setTronBalance(getBalance(BALANCE_KEYS.TRON_USDT))
    setCeloBalance(getBalance(BALANCE_KEYS.CELO_USDT))
  }, [])

  // Handle amount changes - automatically update toAmount to 98% of fromAmount
  const handleFromAmountChange = (value: string) => {
    handleNumericInputChange(value, (validatedValue) => {
      setFromAmount(validatedValue)
      if (validatedValue && !isNaN(parseFloat(validatedValue))) {
        const calculatedToAmount = (parseFloat(validatedValue) * 0.98).toString()
        setToAmount(calculatedToAmount)
      } else {
        setToAmount("")
      }
    })
  }

  // Handle toAmount changes - automatically update fromAmount so toAmount is 98% of fromAmount
  const handleToAmountChange = (value: string) => {
    handleNumericInputChange(value, (validatedValue) => {
      setToAmount(validatedValue)
      if (validatedValue && !isNaN(parseFloat(validatedValue))) {
        // If toAmount should be 98% of fromAmount, then fromAmount = toAmount / 0.98
        const calculatedFromAmount = (parseFloat(validatedValue) / 0.98).toString()
        setFromAmount(calculatedFromAmount)
      } else {
        setFromAmount("")
      }
    })
  }

  const handleSwapChains = () => {
    const tempChainId = fromChainId
    const tempAmount = fromAmount
    
    setFromChainId(toChainId)
    setToChainId(tempChainId)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    
    // Update balance display
    setTronBalance(getBalance(BALANCE_KEYS.TRON_USDT))
    setCeloBalance(getBalance(BALANCE_KEYS.CELO_USDT))
  }

  const handleExecuteBridge = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return
    }

    try {
      setIsExecuting(true)
      
      // Simulate transfer delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const transferAmount = parseFloat(fromAmount)
      const currentTronBalance = parseFloat(getBalance(BALANCE_KEYS.TRON_USDT))
      const currentCeloBalance = parseFloat(getBalance(BALANCE_KEYS.CELO_USDT))
      
      if (fromChainId === 3448148188) {
        // Tron to Celo
        const newTronBalance = Math.max(0, currentTronBalance - transferAmount)
        const newCeloBalance = currentCeloBalance + transferAmount * 0.98 // 2% bridge fee
        
        setBalance(BALANCE_KEYS.TRON_USDT, newTronBalance.toFixed(6))
        setBalance(BALANCE_KEYS.CELO_USDT, newCeloBalance.toFixed(6))
        setTronBalance(newTronBalance.toFixed(6))
        setCeloBalance(newCeloBalance.toFixed(6))
      } else {
        // Celo to Tron
        const newCeloBalance = Math.max(0, currentCeloBalance - transferAmount)
        const newTronBalance = currentTronBalance + transferAmount * 0.98 // 2% bridge fee
        
        setBalance(BALANCE_KEYS.CELO_USDT, newCeloBalance.toFixed(6))
        setBalance(BALANCE_KEYS.TRON_USDT, newTronBalance.toFixed(6))
        setCeloBalance(newCeloBalance.toFixed(6))
        setTronBalance(newTronBalance.toFixed(6))
      }
      
      // Show success toast
      sonnerToast.success("Transfer successful!", {
        description: `Successfully bridged ${fromAmount} USDT from ${getFromChainName()} to ${getToChainName()}`,
        duration: 5000,
      })
      
      // Reset form
      setFromAmount("")
      setToAmount("")
      
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

  const getCurrentBalance = () => {
    return fromChainId === 3448148188 ? tronBalance : celoBalance
  }

  const hasAmount = fromAmount && parseFloat(fromAmount) > 0

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
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">Bridge USDT</h2>
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

                {/* Amount Input - Full Width */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm text-muted-foreground font-medium">Amount</label>
                    <span className="text-xs text-muted-foreground">USDT</span>
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="w-full h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground text-left"
                  />
                  {isConnected && (
                    <div className="text-xs text-muted-foreground px-1 text-left">
                      Balance: {getCurrentBalance()} USDT
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

                {/* To Amount Input - Full Width */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm text-muted-foreground font-medium">You'll receive</label>
                    <span className="text-xs text-muted-foreground">USDT</span>
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    className="w-full h-12 text-base sm:text-lg bg-muted/30 border-border/50 text-foreground text-left"
                  />
                  {isConnected && (
                    <div className="text-xs text-muted-foreground px-1 text-left">
                      Balance: {toChainId === 3448148188 ? tronBalance : celoBalance} USDT
                    </div>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

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
          disabled={!isConnected || !hasAmount || isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : !isConnected ? (
            "Connect Wallet"
          ) : !hasAmount ? (
            "Enter Amount"
          ) : (
            "Transfer"
          )}
        </Button>
      </motion.div>
    </div>
  )
}