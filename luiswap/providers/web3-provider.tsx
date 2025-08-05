'use client'

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi-config'
import { Web3ErrorBoundary } from '@/components/web3/web3-error-boundary'

// Function to create a query client (called on client-side only)
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
        retry: 3,
        refetchOnWindowFocus: false,
        // Add better error handling
        retryOnMount: true,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 2,
        retryDelay: 1000,
      },
    },
    // Add global error handler
    logger: {
      log: console.log,
      warn: console.warn,
      error: (error) => {
        // Suppress specific wallet connection errors that are non-critical
        if (error?.message?.includes('Connection interrupted while trying to subscribe') ||
            error?.message?.includes('Failed to fetch remote project configuration') ||
            error?.message?.includes('cca-lite.coinbase.com/metrics') ||
            error?.message?.includes('net::ERR_ABORTED 401')) {
          console.debug('Non-critical wallet error:', error.message)
          return
        }
        console.error('React Query Error:', error)
      },
    },
  })
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = useState(() => createQueryClient())

  // Add error boundary for WalletConnect issues
  useEffect(() => {
    // Handle unhandled promise rejections from WalletConnect
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      // Suppress non-critical wallet errors
      if (error?.message?.includes('Connection interrupted while trying to subscribe') ||
          error?.message?.includes('Failed to fetch remote project configuration') ||
          error?.message?.includes('HTTP status code: 403') ||
          error?.message?.includes('cca-lite.coinbase.com/metrics') ||
          error?.message?.includes('net::ERR_ABORTED 401')) {
        console.debug('Suppressed wallet error:', error.message)
        event.preventDefault() // Prevent default error handling
        return
      }
      
      // Log other errors normally
      console.error('Unhandled promise rejection:', error)
    }
    
    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error
      
      // Suppress non-critical wallet errors
      if (error?.message?.includes('Connection interrupted while trying to subscribe') ||
          error?.message?.includes('Failed to fetch remote project configuration') ||
          error?.message?.includes('cca-lite.coinbase.com/metrics') ||
          error?.message?.includes('net::ERR_ABORTED 401')) {
        console.debug('Suppressed wallet error in error handler:', error.message)
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  )
}