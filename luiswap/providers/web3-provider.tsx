'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Web3ErrorBoundary } from '@/components/web3/web3-error-boundary'
import { loadWagmiConfig } from '@/lib/dynamic-wagmi-config'
// import { TurnkeyProvider } from '@/contexts/turnkey-context'

// Dynamic imports for wagmi and react-query
let WagmiProvider: any = null
let QueryClient: any = null
let QueryClientProvider: any = null

// Dynamic loader for Web3 dependencies
async function loadWeb3Dependencies() {
  if (typeof window === 'undefined') return null

  try {
    // Load wagmi and react-query dynamically
    const [wagmiModule, reactQueryModule, configResult] = await Promise.all([
      import('wagmi'),
      import('@tanstack/react-query'),
      loadWagmiConfig()
    ])

    WagmiProvider = wagmiModule.WagmiProvider
    QueryClient = reactQueryModule.QueryClient
    QueryClientProvider = reactQueryModule.QueryClientProvider

    return configResult
  } catch (error) {
    console.error('Failed to load Web3 dependencies:', error)
    return null
  }
}

// Function to create a query client (called on client-side only)
function createQueryClient() {
  if (!QueryClient) return null

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [wagmiConfig, setWagmiConfig] = useState<any>(null)
  const [queryClient, setQueryClient] = useState<any>(null)

  // Load Web3 dependencies dynamically
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const configResult = await loadWeb3Dependencies()
        if (configResult?.wagmiConfig) {
          setWagmiConfig(configResult.wagmiConfig)
          setQueryClient(createQueryClient())
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to initialize Web3:', error)
      }
    }

    initWeb3()
  }, [])

  // Add error boundary for wallet issues
  useEffect(() => {
    // Handle unhandled promise rejections from wallets
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

  // Show loading state while Web3 dependencies are loading
  if (!isLoaded || !WagmiProvider || !QueryClientProvider || !wagmiConfig || !queryClient) {
    return (
      <Web3ErrorBoundary>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </Web3ErrorBoundary>
    )
  }

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