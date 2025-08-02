'use client'

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useCallback, useMemo } from 'react'
import { CHAIN_INFO, isChainSupported, getChainInfo } from '@/lib/constants/chains'

export function useWeb3() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()

  // Current chain info
  const currentChain = useMemo(() => {
    return getChainInfo(chainId)
  }, [chainId])

  // Check if current chain is supported
  const isChainSupported = useMemo(() => {
    return chainId ? isChainSupported(chainId) : false
  }, [chainId])

  // Get available connectors
  const availableConnectors = useMemo(() => {
    return connectors.filter(connector => connector.id !== 'turnkey') // Filter out Turnkey for now
  }, [connectors])

  // Connect to a specific connector
  const connectWallet = useCallback((connectorId?: string) => {
    const connector = connectorId 
      ? connectors.find(c => c.id === connectorId)
      : connectors[0]
    
    if (connector) {
      connect({ connector })
    }
  }, [connect, connectors])

  // Switch to a specific chain
  const switchToChain = useCallback((targetChainId: number) => {
    if (targetChainId === chainId) return
    
    if (!isChainSupported(targetChainId)) {
      throw new Error(`Chain ${targetChainId} is not supported`)
    }

    switchChain({ chainId: targetChainId })
  }, [chainId, switchChain])

  // Connect to MetaMask specifically
  const connectMetaMask = useCallback(() => {
    connectWallet('metaMask')
  }, [connectWallet])

  // Connect to WalletConnect
  const connectWalletConnect = useCallback(() => {
    connectWallet('walletConnect')
  }, [connectWallet])

  // Connect to Coinbase Wallet
  const connectCoinbaseWallet = useCallback(() => {
    connectWallet('coinbaseWallet')
  }, [connectWallet])

  // Format address for display
  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  // Connection status
  const connectionStatus = useMemo(() => {
    if (isConnecting || isReconnecting || isConnectPending) return 'connecting'
    if (isConnected) return 'connected'
    return 'disconnected'
  }, [isConnected, isConnecting, isReconnecting, isConnectPending])

  return {
    // Connection state
    address,
    isConnected,
    isConnecting: isConnecting || isReconnecting || isConnectPending,
    connectionStatus,
    
    // Chain state
    chainId,
    currentChain,
    isChainSupported,
    isSwitchPending,
    
    // Actions
    connect: connectWallet,
    connectMetaMask,
    connectWalletConnect,
    connectCoinbaseWallet,
    disconnect,
    switchToChain,
    
    // Connectors
    connectors: availableConnectors,
    
    // Utilities
    formatAddress,
  }
}