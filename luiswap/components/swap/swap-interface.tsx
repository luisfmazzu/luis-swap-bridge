'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowUpDown, Settings, AlertTriangle, Loader2 } from 'lucide-react'
import { TokenSelector } from './token-selector'
import { useSwapState } from '@/hooks/use-swap'
import { useWeb3 } from '@/hooks/use-web3'
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button'
import { Badge } from '@/components/ui/badge'
import { getTokensByChain } from '@/lib/constants/tokens'

export function SwapInterface() {
  const { isConnected, chainId } = useWeb3()
  const [showSettings, setShowSettings] = useState(false)
  
  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    flipTokens,
    fromAmount,
    setFromAmount,
    toAmount,
    slippage,
    setSlippage,
    quote,
    isQuoteLoading,
    exchangeRate,
    needsApproval,
    approveToken,
    isApprovePending,
    isApproveConfirming,
    swap,
    isSwapping,
    isSwapReady,
    swapError,
  } = useSwapState()

  const availableTokens = chainId ? getTokensByChain(chainId) : []
  
  const handleMaxClick = () => {
    // In production, this would set to the actual token balance
    setFromAmount('1000')
  }

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (!fromToken || !toToken) return 'Select tokens'
    if (!fromAmount || parseFloat(fromAmount) <= 0) return 'Enter amount'
    if (needsApproval) return `Approve ${fromToken.symbol}`
    if (isSwapReady) return 'Swap'
    return 'Insufficient balance'
  }

  const handleButtonClick = async () => {
    if (!isConnected) return
    if (needsApproval) {
      await approveToken()
      return
    }
    if (isSwapReady) {
      await swap()
    }
  }

  const isButtonLoading = isApprovePending || isApproveConfirming || isSwapping

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      className="max-w-md mx-auto"
    >
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-foreground">Swap</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {chainId ? `Chain ID: ${chainId}` : 'No chain connected'}
                </p>
              </div>
              <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Settings Panel */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-muted rounded-lg"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Slippage Tolerance
                    </label>
                    <div className="flex gap-2 mt-2">
                      {[0.5, 1, 2].map((value) => (
                        <Button
                          key={value}
                          variant={slippage === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSlippage(value)}
                          className="text-xs"
                        >
                          {value}%
                        </Button>
                      ))}
                      <Input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
                        className="w-20 h-8 text-xs"
                        min="0.1"
                        max="50"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* From Token */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <label className="text-sm text-muted-foreground">From</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-xs h-6 px-2"
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 text-lg bg-muted/30 border-border/50 text-foreground"
                  />
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                    label="Select token"
                  />
                </div>
                {fromToken && (
                  <div className="text-xs text-muted-foreground">
                    Balance: {isConnected ? '1,234.56' : '0.00'} {fromToken.symbol}
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
                    onClick={flipTokens}
                    className="rounded-full border border-border hover:bg-accent"
                    disabled={!fromToken || !toToken}
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
                <label className="text-sm text-muted-foreground">To</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="flex-1 text-lg bg-muted/30 border-border/50 text-foreground"
                  />
                  <TokenSelector
                    selectedToken={toToken}
                    onTokenSelect={setToToken}
                    label="Select token"
                  />
                </div>
                {toToken && (
                  <div className="text-xs text-muted-foreground">
                    Balance: {isConnected ? '987.65' : '0.00'} {toToken.symbol}
                  </div>
                )}
              </motion.div>

              {/* Quote Details */}
              {quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-muted rounded-lg p-4 space-y-2"
                >
                  {exchangeRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="text-foreground">{exchangeRate.display}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-foreground">~$2.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className="text-green-500">{"<0.01%"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slippage</span>
                    <span className="text-foreground">{slippage}%</span>
                  </div>
                  {quote.protocols.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route</span>
                      <div className="flex gap-1">
                        {quote.protocols.slice(0, 3).map((protocol, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {protocol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Loading indicator */}
              {isQuoteLoading && fromAmount && fromToken && toToken && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-4"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Getting best price...
                  </span>
                </motion.div>
              )}

              {/* Error Display */}
              {swapError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {swapError.message || 'Swap failed'}
                  </span>
                </motion.div>
              )}

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {!isConnected ? (
                  <WalletConnectButton className="w-full" />
                ) : (
                  <Button
                    onClick={handleButtonClick}
                    disabled={isButtonLoading || (!isSwapReady && !needsApproval)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isButtonLoading && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {getButtonText()}
                  </Button>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}