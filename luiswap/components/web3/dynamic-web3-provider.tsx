'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientWrapper } from './client-wrapper'

// Dynamic import of Web3Provider to avoid SSR issues with wagmi
const Web3ProviderCore = dynamic(
  () => import('@/providers/web3-provider').then(mod => ({ default: mod.Web3Provider })),
  {
    loading: () => <Web3ProviderSkeleton />,
    ssr: false, // Disable server-side rendering for Web3 provider
  }
)

function Web3ProviderSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="w-full py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <div className="hidden xl:flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-16" />
              ))}
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="xl:hidden h-8 w-8" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex justify-center">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DynamicWeb3ProviderProps {
  children: ReactNode
}

export function DynamicWeb3Provider({ children }: DynamicWeb3ProviderProps) {
  return (
    <ClientWrapper fallback={<Web3ProviderSkeleton />}>
      <Web3ProviderCore>
        {children}
      </Web3ProviderCore>
    </ClientWrapper>
  )
}