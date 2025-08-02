"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Users, 
  Activity,
  Clock,
  DollarSign
} from "lucide-react"
import { useNetworkStats, useGasTracker } from "@/hooks/use-live-events"

export function NetworkStats() {
  const { data: networkStats, isLoading: isLoadingStats } = useNetworkStats()
  const { data: gasData, isLoading: isLoadingGas } = useGasTracker()

  if (isLoadingStats || isLoadingGas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-muted/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/50 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!networkStats || !gasData) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Unable to load network statistics</p>
        </CardContent>
      </Card>
    )
  }

  const formatNumber = (num: number, suffix?: string) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B${suffix || ''}`
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M${suffix || ''}`
    }
    if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K${suffix || ''}`
    }
    return `${num.toFixed(0)}${suffix || ''}`
  }

  const formatUSD = (num: number) => {
    return `$${formatNumber(num)}`
  }

  return (
    <div className="space-y-6">
      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {networkStats.map((network, index) => {
          const gasInfo = gasData.find(g => g.chainId === network.chainId)
          const change24h = (Math.random() - 0.5) * 20 // Mock 24h change
          const isPositive = change24h >= 0

          return (
            <motion.div
              key={network.chainId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:bg-muted/20 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{network.chainName}</CardTitle>
                    <Badge 
                      variant={gasInfo && gasInfo.utilization < 70 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {gasInfo ? `${gasInfo.utilization.toFixed(0)}%` : 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* TVL */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">TVL</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">
                        {formatUSD(network.tvl)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isPositive ? '+' : ''}{change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* 24h Volume */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">24h Vol</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatUSD(network.volume24h)}
                    </span>
                  </div>

                  {/* Active Users */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Users</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {formatNumber(network.activeUsers24h)}
                    </span>
                  </div>

                  {/* Gas Price */}
                  {gasInfo && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Gas</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {gasInfo.gasPrice.standard.toFixed(0)} gwei
                      </span>
                    </div>
                  )}

                  {/* Block Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Block</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {network.blockTime.toFixed(1)}s
                    </span>
                  </div>

                  {/* Network Utilization */}
                  {gasInfo && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Network Load</span>
                        <span className="text-foreground">{gasInfo.utilization.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={gasInfo.utilization} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Gas Tracker Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Gas Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gasData.map((gas, index) => (
                <motion.div
                  key={gas.chainId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-4 rounded-lg border border-border bg-muted/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{gas.chainName}</span>
                    <Badge 
                      variant={gas.utilization < 50 ? "default" : gas.utilization < 80 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {gas.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slow</span>
                      <span className="text-foreground">{gas.gasPrice.slow.toFixed(0)} gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standard</span>
                      <span className="text-foreground">{gas.gasPrice.standard.toFixed(0)} gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fast</span>
                      <span className="text-foreground">{gas.gasPrice.fast.toFixed(0)} gwei</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}