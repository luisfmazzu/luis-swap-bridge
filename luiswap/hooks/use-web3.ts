'use client'

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useCallback, useMemo } from 'react'
import { CHAIN_INFO, isChainSupported as checkChainSupported, getChainInfo } from '@/lib/constants/chains'
import { useUnifiedWallet, useWalletConnection } from '@/contexts/unified-wallet-provider'

export function useWeb3() {
  // Get unified wallet state (single source of truth)
  const { state: unifiedState } = useUnifiedWallet()
  const { isConnected, isConnecting, address, connectionType, chainId } = useWalletConnection()
  
  // Still use wagmi hooks for actions (they work perfectly)
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()
  
  // Current chain info
  const currentChain = useMemo(() => {
    return getChainInfo(chainId)
  }, [chainId])

  // Check if current chain is supported
  const isChainSupported = useMemo(() => {
    return chainId ? checkChainSupported(chainId) : false
  }, [chainId])

  // Get available connectors
  const availableConnectors = useMemo(() => {
    return connectors
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
    
    if (!checkChainSupported(targetChainId)) {
      throw new Error(`Chain ${targetChainId} is not supported`)
    }

    switchChain({ chainId: targetChainId as any })
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

  // Enhanced disconnect that uses unified provider
  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  // Format address for display
  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  // Connection status derived from unified state
  const connectionStatus = useMemo(() => {
    if (isConnecting || isConnectPending) return 'connecting'
    if (isConnected) return 'connected'
    return 'disconnected'
  }, [isConnected, isConnecting, isConnectPending])

  return {
    // Connection state (from unified provider - single source of truth)
    address,
    isConnected,
    isConnecting,
    connectionStatus,
    connectionType,
    
    // Chain state
    chainId,
    currentChain,
    isChainSupported,
    isSwitchPending,
    
    // Actions (wagmi hooks work perfectly)
    connect: connectWallet,
    connectMetaMask,
    connectWalletConnect,
    connectCoinbaseWallet,
    disconnect: disconnectWallet,
    switchToChain,
    
    // Connectors
    connectors: availableConnectors,
    
    // Utilities
    formatAddress,
  }
}