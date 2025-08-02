"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Settings, ChevronDown } from "lucide-react"

export function DashboardPreview() {
  const [fromAmount, setFromAmount] = useState("1,000")
  const [toAmount, setToAmount] = useState("999.85")
  const [fromToken, setFromToken] = useState("USDC-ETH")
  const [toToken, setToToken] = useState("USDT-POLY")

  const tokens = [
    { symbol: "USDC", name: "USD Coin", chain: "Ethereum", id: "USDC-ETH" },
    { symbol: "USDT", name: "Tether USD", chain: "Ethereum", id: "USDT-ETH" },
    { symbol: "DAI", name: "Dai Stablecoin", chain: "Ethereum", id: "DAI-ETH" },
    { symbol: "USDC", name: "USD Coin", chain: "Polygon", id: "USDC-POLY" },
    { symbol: "USDT", name: "Tether USD", chain: "Polygon", id: "USDT-POLY" },
  ]

  const getTokenInfo = (tokenId) => {
    return tokens.find((token) => token.id === tokenId) || tokens[0]
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer glow container */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl scale-110 opacity-60"></div>

        {/* Main card */}
        <Card className="relative bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Swap</h2>
              <Button variant="ghost" size="icon" className="opacity-60">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">From</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={fromAmount}
                    readOnly
                    className="pr-40 text-lg bg-muted/30 border-border/50 text-foreground cursor-default"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-transparent hover:bg-muted/30 rounded-md px-2 py-1 cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">U</span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">USDC</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Ethereum</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Balance: 5,234.56 USDC</div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-border hover:bg-accent opacity-80"
                  disabled
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">To</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={toAmount}
                    readOnly
                    className="pr-40 text-lg bg-muted/30 border-border/50 text-foreground cursor-default"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-transparent hover:bg-muted/30 rounded-md px-2 py-1 cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-purple-500">T</span>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">USDT</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Polygon</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Balance: 2,187.43 USDT</div>
              </div>

              {/* Swap Details */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="text-foreground">1 USDC = 0.9998 USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~$2.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className="text-green-500">{"<0.01%"}</span>
                </div>
              </div>

              {/* Swap Button */}
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                Swap Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
