'use client'

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useCallback, useMemo, useEffect } from 'react'
import { CHAIN_INFO, isChainSupported as checkChainSupported, getChainInfo } from '@/lib/constants/chains'
import { useWalletStore, useActiveWallet } from '@/lib/stores/wallet-store'

export function useWeb3() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()

  // Wallet store integration
  const { 
    setWagmiConnection, 
    setWagmiConnecting, 
    disconnectWagmi,
    setActiveConnection,
  } = useWalletStore()
  const activeWallet = useActiveWallet()

  // Sync wagmi state with store - only sync when wagmi is actively connected
  // Don't auto-disconnect when Turnkey is active
  useEffect(() => {
    if (isConnected && address) {
      // Only update wagmi connection if Turnkey isn't the active connection
      if (activeWallet?.type !== 'turnkey') {
        setWagmiConnection(address, chainId)
      }
    } else if (!isConnected && activeWallet?.type === 'wagmi') {
      // Only disconnect wagmi in store if it was the active connection
      disconnectWagmi()
    }
  }, [isConnected, address, chainId, setWagmiConnection, disconnectWagmi, activeWallet?.type])

  useEffect(() => {
    setWagmiConnecting(isConnecting || isReconnecting || isConnectPending)
  }, [isConnecting, isReconnecting, isConnectPending, setWagmiConnecting])

  // Current chain info
  const currentChain = useMemo(() => {
    return getChainInfo(chainId)
  }, [chainId])

  // Check if current chain is supported
  const isChainSupported = useMemo(() => {
    return chainId ? checkChainSupported(chainId) : false
  }, [chainId])

  // Get available connectors (include all connectors)
  const availableConnectors = useMemo(() => {
    return connectors // Include all connectors including Turnkey
  }, [connectors])

  // Connect to a specific connector
  const connectWallet = useCallback((connectorId?: string) => {
    const connector = connectorId 
      ? connectors.find(c => c.id === connectorId)
      : connectors[0]
    
    if (connector) {
      connect({ connector })
      setActiveConnection('wagmi')
    }
  }, [connect, connectors, setActiveConnection])

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

  // Enhanced disconnect that handles both wagmi and store
  const disconnectWallet = useCallback(() => {
    disconnect()
    disconnectWagmi()
  }, [disconnect, disconnectWagmi])

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

  // Return unified state when possible, favoring active wallet
  const unifiedAddress = activeWallet?.address || address
  const unifiedIsConnected = activeWallet?.isConnected || isConnected
  const unifiedIsConnecting = activeWallet?.isConnecting || isConnecting || isReconnecting || isConnectPending
  const unifiedChainId = activeWallet?.chainId || chainId

  return {
    // Connection state (unified when active wallet is present)
    address: unifiedAddress,
    isConnected: unifiedIsConnected,
    isConnecting: unifiedIsConnecting,
    connectionStatus,
    
    // Chain state
    chainId: unifiedChainId,
    currentChain,
    isChainSupported,
    isSwitchPending,
    
    // Active wallet info
    activeWallet,
    
    // Actions
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