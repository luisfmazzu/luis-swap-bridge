'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { ClientWrapper } from './client-wrapper'

// Dynamic import of UnifiedConnectionManager to avoid SSR issues
const ConnectionManagerCore = dynamic(
  () => import('../wallet/unified-connection-manager').then(mod => ({ default: mod.UnifiedConnectionManager })),
  {
    loading: () => <ConnectionManagerSkeleton />,
    ssr: false, // Disable server-side rendering for wallet connections
  }
)

interface ConnectionManagerSkeletonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

function ConnectionManagerSkeleton({ className = '', variant = 'default' }: ConnectionManagerSkeletonProps) {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }
  
  return (
    <Button 
      variant={variant}
      className={`${className} ${baseClasses} ${variantClasses[variant]}`}
      disabled
    >
      <Wallet className="h-4 w-4 mr-2" />
      <Skeleton className="h-4 w-16" />
    </Button>
  )
}

interface DynamicConnectionManagerProps {
  className?: string
  showChainInfo?: boolean
  variant?: 'default' | 'outline' | 'ghost'
}

export function DynamicConnectionManager(props: DynamicConnectionManagerProps) {
  return (
    <ClientWrapper 
      fallback={
        <ConnectionManagerSkeleton 
          className={props.className}
          variant={props.variant}
        />
      }
    >
      <ConnectionManagerCore {...props} />
    </ClientWrapper>
  )
}