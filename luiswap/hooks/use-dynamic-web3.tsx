'use client'

import React, { useState, useEffect } from 'react'

// Dynamic import types
type UseWeb3Return = {
  address?: string
  isConnected: boolean
  isConnecting: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  chainId?: number
  currentChain?: any
  isChainSupported: boolean
  isSwitchPending: boolean
  connect: (connectorId?: string) => void
  connectMetaMask: () => void
  connectWalletConnect: () => void
  connectCoinbaseWallet: () => void
  disconnect: () => void
  switchToChain: (chainId: number) => void
  connectors: any[]
  formatAddress: (addr?: string) => string
}

// Default/loading state
const defaultWeb3State: UseWeb3Return = {
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connectionStatus: 'disconnected',
  chainId: undefined,
  currentChain: undefined,
  isChainSupported: false,
  isSwitchPending: false,
  connect: () => {},
  connectMetaMask: () => {},
  connectWalletConnect: () => {},
  connectCoinbaseWallet: () => {},
  disconnect: () => {},
  switchToChain: () => {},
  connectors: [],
  formatAddress: (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '',
}

// Hook to dynamically load Web3 functionality
export function useDynamicWeb3(): UseWeb3Return {
  const [web3State, setWeb3State] = useState<UseWeb3Return>(defaultWeb3State)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only load Web3 on client side
    if (typeof window === 'undefined') return

    const loadWeb3 = async () => {
      try {
        // Dynamic import of the actual Web3 hook
        const { useWeb3 } = await import('@/hooks/use-web3')
        setIsLoaded(true)
        
        // Note: This is a simplified approach. In practice, you'd need to 
        // handle this within a component that can use the actual hook
      } catch (error) {
        console.error('Failed to load Web3 hook:', error)
      }
    }

    loadWeb3()
  }, [])

  return web3State
}

// Dynamic Web3 wrapper component for hooks
export function withDynamicWeb3<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function DynamicWeb3Component(props: T) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)
    }, [])

    if (!isClient) {
      return null // or loading component
    }

    return <Component {...props} />
  }
}