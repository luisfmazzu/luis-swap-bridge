"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"

export default function ExplorePage() {
  const tokens = [
    { symbol: "USDC", name: "USD Coin", amount: "1,234.56", value: "$1,234.56", chain: "Ethereum" },
    { symbol: "USDT", name: "Tether USD", amount: "987.65", value: "$987.65", chain: "Ethereum" },
    { symbol: "DAI", name: "Dai Stablecoin", amount: "543.21", value: "$543.21", chain: "Ethereum" },
    { symbol: "USDC.e", name: "USD Coin", amount: "321.09", value: "$321.09", chain: "Polygon" },
  ]

  const totalBalance = tokens.reduce(
    (sum, token) => sum + Number.parseFloat(token.value.replace("$", "").replace(",", "")),
    0,
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Wallet Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-xl font-semibold text-foreground mb-4"
                  >
                    Portfolio Overview
                  </motion.h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Wallet Address", value: "0x1234...5678", mono: true },
                      { label: "Total Balance", value: `$${totalBalance.toLocaleString()}`, large: true },
                      { label: "24h Change", value: "+$12.34 (+0.4%)", green: true },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                      >
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p
                          className={`${item.mono ? "text-sm font-mono" : item.large ? "text-2xl font-bold" : "text-lg font-semibold"} ${
                            item.green ? "text-green-500" : "text-foreground"
                          }`}
                        >
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Token List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-lg font-semibold text-foreground mb-4"
                  >
                    Your Tokens
                  </motion.h3>
                  <div className="space-y-4">
                    {tokens.map((token, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                          >
                            <span className="text-sm font-bold text-primary">{token.symbol.charAt(0)}</span>
                          </motion.div>
                          <div>
                            <p className="font-medium text-foreground">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {token.name} • {token.chain}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{token.amount}</p>
                          <p className="text-sm text-muted-foreground">{token.value}</p>
                        </div>
                      </motion.div>
                    ))}
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
