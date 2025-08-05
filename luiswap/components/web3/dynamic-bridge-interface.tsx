'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ClientWrapper } from './client-wrapper'

// Dynamic import of BridgeInterface to avoid SSR issues
const BridgeInterface = dynamic(
  () => import('@/components/bridge/bridge-interface').then(mod => ({ default: mod.BridgeInterface })),
  {
    loading: () => <BridgeInterfaceSkeleton />,
    ssr: false, // Disable server-side rendering for this component
  }
)

function BridgeInterfaceSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* From Token */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded" />
              </div>
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bridge Routes Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <Skeleton className="w-full h-12 rounded" />
    </div>
  )
}

export function DynamicBridgeInterface() {
  return (
    <ClientWrapper fallback={<BridgeInterfaceSkeleton />}>
      <BridgeInterface />
    </ClientWrapper>
  )
}