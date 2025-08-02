"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  ArrowUpDown, 
  Send, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Play,
  Pause
} from "lucide-react"
import { useLiveEvents } from "@/hooks/use-live-events"
import { useState } from "react"

export function EventFeed() {
  const { events, isSubscribed, startListening, stopListening } = useLiveEvents()
  const [filter, setFilter] = useState<'all' | 'swap' | 'bridge' | 'transfer' | 'approval'>('all')

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.type === filter
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowUpDown className="h-4 w-4" />
      case 'bridge':
        return <Activity className="h-4 w-4" />
      case 'transfer':
        return <Send className="h-4 w-4" />
      case 'approval':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'swap':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'bridge':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'transfer':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'approval':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getExplorerUrl = (hash: string, chainId: number) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      56: 'https://bscscan.com',
      42161: 'https://arbiscan.io',
      10: 'https://optimistic.etherscan.io',
      43114: 'https://snowtrace.io'
    }
    return `${explorers[chainId] || 'https://etherscan.io'}/tx/${hash}`
  }

  return (
    <Card className="bg-card border-border h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Events
            {events.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {events.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isSubscribed ? stopListening : startListening}
              className="flex items-center gap-1"
            >
              {isSubscribed ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          {(['all', 'swap', 'bridge', 'transfer', 'approval'] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-center"
              >
                <div>
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {filter === 'all' ? 'No live events yet' : `No ${filter} events yet`}
                  </p>
                  {!isSubscribed && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Click "Start" to begin monitoring
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full border ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground capitalize">
                              {event.type}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.chainName}
                            </Badge>
                            <Badge 
                              variant={event.status === 'success' ? 'default' : event.status === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {event.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {event.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {event.status}
                            </Badge>
                          </div>
                          
                          {event.tokenIn && event.tokenOut && (
                            <div className="text-sm text-muted-foreground mb-2">
                              {event.tokenIn.amount} {event.tokenIn.symbol} → {event.tokenOut.amount} {event.tokenOut.symbol}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground font-mono">
                            {event.hash.slice(0, 10)}...{event.hash.slice(-8)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(event.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-muted-foreground hover:text-primary"
                          onClick={() => window.open(getExplorerUrl(event.hash, event.chainId), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}