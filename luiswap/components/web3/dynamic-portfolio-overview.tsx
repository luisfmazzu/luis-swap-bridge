'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ClientWrapper } from './client-wrapper'

// Dynamic import of PortfolioOverview to avoid SSR issues
const PortfolioOverview = dynamic(
  () => import('@/components/portfolio/portfolio-overview').then(mod => ({ default: mod.PortfolioOverview })),
  {
    loading: () => <PortfolioOverviewSkeleton />,
    ssr: false, // Disable server-side rendering for this component
  }
)

function PortfolioOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-border">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chain Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DynamicPortfolioOverview() {
  return (
    <ClientWrapper fallback={<PortfolioOverviewSkeleton />}>
      <PortfolioOverview />
    </ClientWrapper>
  )
}