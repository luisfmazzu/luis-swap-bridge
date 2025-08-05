'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ClientWrapper } from './client-wrapper'

// Dynamic import of SwapInterface to avoid SSR issues
const SwapInterface = dynamic(
  () => import('@/components/swap/swap-interface').then(mod => ({ default: mod.SwapInterface })),
  {
    loading: () => <SwapInterfaceSkeleton />,
    ssr: false, // Disable server-side rendering for this component
  }
)

function SwapInterfaceSkeleton() {
  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* From Token */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-12 rounded" />
                <Skeleton className="h-12 w-24 rounded" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-12 rounded" />
                <Skeleton className="h-12 w-24 rounded" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Action Button */}
            <Skeleton className="w-full h-12 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DynamicSwapInterface() {
  return (
    <ClientWrapper fallback={<SwapInterfaceSkeleton />}>
      <SwapInterface />
    </ClientWrapper>
  )
}