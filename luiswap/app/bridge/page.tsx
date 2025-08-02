"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"

export default function BridgePage() {
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState("USDC-ETH")
  const [toToken, setToToken] = useState("USDT-ETH")

  const tokens = [
    { symbol: "USDC", name: "USD Coin", chain: "Ethereum", id: "USDC-ETH" },
    { symbol: "USDT", name: "Tether USD", chain: "Ethereum", id: "USDT-ETH" },
    { symbol: "DAI", name: "Dai Stablecoin", chain: "Ethereum", id: "DAI-ETH" },
    { symbol: "USDC", name: "USD Coin", chain: "Polygon", id: "USDC-POLY" },
    { symbol: "USDT", name: "Tether USD", chain: "Polygon", id: "USDT-POLY" },
  ]

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const getTokenInfo = (tokenId) => {
    return tokens.find((token) => token.id === tokenId) || tokens[0]
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="max-w-md mx-auto"
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
                    <h2 className="text-xl font-semibold text-foreground">Bridge</h2>
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
                      <label className="text-sm text-muted-foreground">From</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          className="pr-32 text-lg bg-muted/30 border-border/50 text-foreground"
                        />
                        <Select value={fromToken} onValueChange={setFromToken}>
                          <SelectTrigger className="absolute right-2 top-1/2 -translate-y-1/2 w-28 border-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className="bg-background/95 border-border min-w-[240px] shadow-xl backdrop-blur-sm"
                            style={{ zIndex: 9999 }}
                            position="popper"
                            sideOffset={5}
                          >
                            {tokens.map((token) => (
                              <SelectItem key={token.id} value={token.id} className="hover:bg-accent/50">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-foreground">{token.symbol}</span>
                                  <span className="text-xs text-muted-foreground">{token.chain}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: 1,234.56 {getTokenInfo(fromToken).symbol}
                      </div>
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
                          onClick={handleSwapTokens}
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
                      <label className="text-sm text-muted-foreground">To</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={toAmount}
                          onChange={(e) => setToAmount(e.target.value)}
                          className="pr-32 text-lg bg-muted/30 border-border/50 text-foreground"
                        />
                        <Select value={toToken} onValueChange={setToToken}>
                          <SelectTrigger className="absolute right-2 top-1/2 -translate-y-1/2 w-28 border-0 bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className="bg-background/95 border-border min-w-[240px] shadow-xl backdrop-blur-sm"
                            style={{ zIndex: 999 }}
                            position="popper"
                            sideOffset={5}
                          >
                            {tokens.map((token) => (
                              <SelectItem key={token.id} value={token.id} className="hover:bg-accent/50">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-foreground">{token.symbol}</span>
                                  <span className="text-xs text-muted-foreground">{token.chain}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: 987.65 {getTokenInfo(toToken).symbol}
                      </div>
                    </motion.div>

                    {/* Swap Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="bg-muted rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="text-foreground">
                          1 {getTokenInfo(fromToken).symbol} = 0.9998 {getTokenInfo(toToken).symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee</span>
                        <span className="text-foreground">~$2.50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price Impact</span>
                        <span className="text-green-500">{"<0.01%"}</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Connect Wallet
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <PageFooter />
    </div>
  )
}
