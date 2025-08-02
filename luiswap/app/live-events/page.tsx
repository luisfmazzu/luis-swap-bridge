"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Info } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"

export default function LiveEventsPage() {
  const [events, setEvents] = useState([])
  const [isListening, setIsListening] = useState(true)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const contractAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7"

  const eventTypes = [
    { type: "Swap", color: "text-blue-400" },
    { type: "Transfer", color: "text-green-400" },
    { type: "Approval", color: "text-yellow-400" },
    { type: "Mint", color: "text-purple-400" },
    { type: "Burn", color: "text-red-400" },
  ]

  const generateRandomEvent = () => {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const amounts = ["1,234.56", "987.65", "543.21", "2,100.00", "756.89", "1,890.45"]
    const tokens = ["USDC", "USDT", "DAI", "WETH", "WBTC"]
    const addresses = ["0x1234...5678", "0xabcd...ef01", "0x9876...5432", "0xfedc...ba98", "0x1111...2222"]

    return {
      id: Date.now() + Math.random(),
      type: eventType.type,
      color: eventType.color,
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      token: tokens[Math.floor(Math.random() * tokens.length)],
      from: addresses[Math.floor(Math.random() * addresses.length)],
      to: addresses[Math.floor(Math.random() * addresses.length)],
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      timestamp: new Date(),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    }
  }

  useEffect(() => {
    if (!isListening) return

    const interval = setInterval(
      () => {
        const newEvent = generateRandomEvent()
        setEvents((prev) => [newEvent, ...prev.slice(0, 49)]) // Keep only last 50 events
      },
      Math.random() * 3000 + 1000,
    ) // Random interval between 1-4 seconds

    return () => clearInterval(interval)
  }, [isListening])

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  const truncateAddress = (address: string, maxLength = 20) => {
    if (address.length <= maxLength) return address
    return `${address.slice(0, maxLength - 3)}...`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="max-w-6xl mx-auto space-y-4 sm:space-y-6"
          >
            {/* Contract Info Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="text-lg sm:text-xl font-semibold text-foreground"
                    >
                      Smart Contract Events
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={toggleListening}
                        variant={isListening ? "default" : "outline"}
                        className="flex items-center gap-2 text-sm sm:text-base"
                        size="sm"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                        />
                        {isListening ? "Live" : "Paused"}
                      </Button>
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-mono text-foreground bg-muted/30 px-3 py-2 rounded-md flex-1 min-w-0">
                          <span className="hidden xs:inline">{contractAddress}</span>
                          <span className="xs:hidden">{truncateAddress(contractAddress, 16)}</span>
                        </p>
                        {/* Copy button for small screens */}
                        <Button
                          onClick={copyAddress}
                          variant="outline"
                          size="sm"
                          className="xs:hidden flex-shrink-0 bg-transparent"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      {/* Copy button for larger screens */}
                      <Button
                        onClick={copyAddress}
                        variant="outline"
                        size="sm"
                        className="hidden xs:flex items-center gap-2 mt-2 bg-transparent"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedAddress ? "Copied!" : "Copy Address"}
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{events.length}</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Events List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-base sm:text-lg font-semibold text-foreground mb-4"
                  >
                    Recent Events
                  </motion.h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                            >
                              <span className={`text-xs sm:text-sm font-bold ${event.color}`}>
                                {event.type.charAt(0)}
                              </span>
                            </motion.div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium text-sm sm:text-base ${event.color}`}>{event.type}</span>
                                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {event.amount} {event.token}
                                </span>
                              </div>
                              {/* Desktop view - show full info */}
                              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{event.from}</span>
                                <span>→</span>
                                <span className="truncate">{event.to}</span>
                              </div>
                              {/* Mobile view - show modal trigger */}
                              <div className="sm:hidden">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      <Info className="w-3 h-3 mr-1" />
                                      View Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-background border-border max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-foreground">Event Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Type: </span>
                                        <span className={`font-medium ${event.color}`}>{event.type}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Amount: </span>
                                        <span className="text-foreground">
                                          {event.amount} {event.token}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">From: </span>
                                        <span className="text-foreground font-mono text-xs break-all">
                                          {event.from}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">To: </span>
                                        <span className="text-foreground font-mono text-xs break-all">{event.to}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Tx Hash: </span>
                                        <span className="text-foreground font-mono text-xs break-all">
                                          {event.txHash}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Block: </span>
                                        <span className="text-foreground">#{event.blockNumber.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Time: </span>
                                        <span className="text-foreground">{event.timestamp.toLocaleTimeString()}</span>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                          {/* Desktop view - show transaction details */}
                          <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground font-mono">{event.txHash}</p>
                            <p className="text-xs text-muted-foreground">Block #{event.blockNumber.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{event.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {events.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <p className="text-sm sm:text-base">Waiting for events...</p>
                        <p className="text-xs sm:text-sm mt-2">Events will appear here in real-time</p>
                      </motion.div>
                    )}
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
