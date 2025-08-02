"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, ExternalLink } from "lucide-react"
import { formatUnits } from "viem"
import type { BridgeRoute } from "@/lib/api/bridge"

interface BridgeSelectorProps {
  routes: BridgeRoute[]
  selectedRoute?: BridgeRoute
  onSelectRoute: (route: BridgeRoute) => void
  isLoading?: boolean
}

export function BridgeSelector({ routes, selectedRoute, onSelectRoute, isLoading }: BridgeSelectorProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!routes.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No bridge routes available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {routes.map((route, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                selectedRoute === route
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
              onClick={() => onSelectRoute(route)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {route.protocol}
                    </Badge>
                    {route.isRecommended && (
                      <Badge variant="default" className="text-xs bg-green-500">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {route.estimatedTime}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {formatUnits(BigInt(route.toAmount), route.toToken.decimals)} {route.toToken.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Fee: ${Number(formatUnits(BigInt(route.fee), 6)).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{route.fromChain.name}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{route.toChain.name}</span>
                {route.txUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-auto text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(route.txUrl, '_blank')
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}