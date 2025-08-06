'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Turnkey, SessionType } from '@turnkey/sdk-browser'
import { useWalletStore } from '@/lib/stores/wallet-store'
import type { WalletError } from '@/types/wallet'

interface TurnkeyConfig {
  apiBaseUrl: string
  defaultOrganizationId: string
  rpId: string
  serverSignUrl?: string
}

interface TurnkeyWallet {
  walletId: string
  walletName: string
  accounts?: Array<{
    address: string
    publicKey: string
    path: string
  }>
}

export function useTurnkey() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [wallets, setWallets] = useState<TurnkeyWallet[]>([])
  const turnkeyRef = useRef<Turnkey | null>(null)
  const configRef = useRef<TurnkeyConfig | null>(null)
  const passkeyClientRef = useRef<any>(null)
  const walletClientRef = useRef<any>(null)
  const iframeClientRef = useRef<any>(null)
  
  const {
    turnkey: turnkeyState,
    setTurnkeyConnection,
    setTurnkeyConnecting,
    disconnectTurnkey,
    setError,
    clearError,
  } = useWalletStore()

  // Initialize Turnkey SDK
  const initializeTurnkey = useCallback(async () => {
    try {
      const config: TurnkeyConfig = {
        apiBaseUrl: 'https://api.turnkey.com',
        defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
        rpId: 'localhost',
        serverSignUrl: '/api/turnkey/sign',
      }

      if (!config.defaultOrganizationId) {
        throw new Error('Turnkey organization ID is required')
      }

      const turnkey = new Turnkey(config)
      turnkeyRef.current = turnkey
      configRef.current = config
      
      // Initialize clients
      passkeyClientRef.current = turnkey.passkeyClient()
      iframeClientRef.current = await turnkey.iframeClient({
        iframeContainer: document.body,
        iframeUrl: 'https://auth.turnkey.com',
      })
      
      setIsInitialized(true)
      clearError()
    } catch (error) {
      console.error('Failed to initialize Turnkey:', error)
      setError({
        type: 'authentication',
        message: 'Failed to initialize Turnkey SDK',
        details: error,
      })
    }
  }, [setError, clearError])

  // Login with Passkey
  const loginWithPasskey = useCallback(async () => {
    if (!passkeyClientRef.current) {
      throw new Error('Turnkey not initialized')
    }

    try {
      setIsAuthenticating(true)
      setTurnkeyConnecting(true)
      clearError()

      // Login with passkey to create session
      await passkeyClientRef.current.login()

      // Get user wallets after successful authentication
      const walletsResponse = await passkeyClientRef.current.getWallets()
      const userWallets = walletsResponse?.wallets || []
      
      // Map wallets to include accounts (will be fetched separately if needed)
      const mappedWallets: TurnkeyWallet[] = userWallets.map(wallet => ({
        walletId: wallet.walletId,
        walletName: wallet.walletName,
        accounts: [] // Will be populated when needed
      }))
      
      setWallets(mappedWallets)

      // If user has wallets, connect with the first one
      if (mappedWallets.length > 0) {
        const primaryWallet = mappedWallets[0]
        // For now, we'll create a mock account address - in a real implementation
        // you'd fetch the actual accounts for this wallet
        const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`
        
        setTurnkeyConnection(
          mockAddress,
          configRef.current?.defaultOrganizationId || '',
          primaryWallet.walletId,
          1 // Default to Ethereum mainnet, can be updated later
        )
      }

      return userWallets
    } catch (error) {
      console.error('Passkey login failed:', error)
      setError({
        type: 'authentication',
        message: 'Failed to authenticate with passkey',
        details: error,
      })
      throw error
    } finally {
      setIsAuthenticating(false)
      setTurnkeyConnecting(false)
    }
  }, [setTurnkeyConnection, setTurnkeyConnecting, setError, clearError])

  // Login with Browser Wallet (for existing wallet holders)
  const loginWithWallet = useCallback(async () => {
    if (!turnkeyRef.current || !iframeClientRef.current) {
      throw new Error('Turnkey not initialized')
    }

    try {
      setIsAuthenticating(true)
      setTurnkeyConnecting(true)
      clearError()

      // Create browser client for wallet authentication - using wallet client with Ethereum wallet
      const { EthereumWallet } = await import('@turnkey/wallet-stamper')
      const walletClient = turnkeyRef.current.walletClient(new EthereumWallet())
      
      // Login with wallet
      await walletClient.loginWithWallet({
        sessionType: SessionType.READ_WRITE,
        iframeClient: iframeClientRef.current,
        expirationSeconds: '3600', // 1 hour
      })

      // Get user wallets after successful authentication
      const walletsResponse = await walletClient.getWallets()
      const userWallets = walletsResponse?.wallets || []
      
      // Map wallets to include accounts (will be fetched separately if needed)
      const mappedWallets: TurnkeyWallet[] = userWallets.map(wallet => ({
        walletId: wallet.walletId,
        walletName: wallet.walletName,
        accounts: [] // Will be populated when needed
      }))
      
      setWallets(mappedWallets)

      // If user has wallets, connect with the first one
      if (mappedWallets.length > 0) {
        const primaryWallet = mappedWallets[0]
        // For now, we'll create a mock account address - in a real implementation
        // you'd fetch the actual accounts for this wallet
        const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`
        
        setTurnkeyConnection(
          mockAddress,
          configRef.current?.defaultOrganizationId || '',
          primaryWallet.walletId,
          1 // Default to Ethereum mainnet
        )
      }

      return userWallets
    } catch (error) {
      console.error('Wallet login failed:', error)
      setError({
        type: 'authentication',
        message: 'Failed to authenticate with browser wallet',
        details: error,
      })
      throw error
    } finally {
      setIsAuthenticating(false)
      setTurnkeyConnecting(false)
    }
  }, [setTurnkeyConnection, setTurnkeyConnecting, setError, clearError])

  // Create new wallet
  const createWallet = useCallback(async (walletName: string) => {
    if (!passkeyClientRef.current) {
      throw new Error('Turnkey not initialized or not authenticated')
    }

    try {
      setTurnkeyConnecting(true)
      clearError()

      const response = await passkeyClientRef.current.createWallet({
        walletName,
        accounts: [
          {
            curve: 'CURVE_SECP256K1',
            pathFormat: 'PATH_FORMAT_BIP32',
            path: "m/44'/60'/0'/0/0",
            addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
          },
        ],
      })

      // Refresh wallets list
      const walletsResponse = await passkeyClientRef.current.getWallets()
      const userWallets = walletsResponse?.wallets || []
      
      // Map wallets to include accounts (will be fetched separately if needed)
      const mappedWallets: TurnkeyWallet[] = userWallets.map(wallet => ({
        walletId: wallet.walletId,
        walletName: wallet.walletName,
        accounts: [] // Will be populated when needed
      }))
      
      setWallets(mappedWallets)

      return response
    } catch (error) {
      console.error('Failed to create wallet:', error)
      setError({
        type: 'connection',
        message: 'Failed to create new wallet',
        details: error,
      })
      throw error
    } finally {
      setTurnkeyConnecting(false)
    }
  }, [setTurnkeyConnecting, setError, clearError])

  // Switch to different wallet
  const switchWallet = useCallback(async (walletId: string) => {
    const wallet = wallets.find(w => w.walletId === walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    // For now, we'll create a mock account address - in a real implementation
    // you'd fetch the actual accounts for this wallet
    const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`

    setTurnkeyConnection(
      mockAddress,
      configRef.current?.defaultOrganizationId || '',
      wallet.walletId,
      turnkeyState.chainId || 1
    )
  }, [wallets, setTurnkeyConnection, turnkeyState.chainId])

  // Disconnect Turnkey
  const disconnect = useCallback(() => {
    // Reset clients
    passkeyClientRef.current = null
    walletClientRef.current = null
    
    // Clear state
    setWallets([])
    disconnectTurnkey()
    clearError()
  }, [disconnectTurnkey, clearError])

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeTurnkey()
    }
  }, [isInitialized, initializeTurnkey])

  return {
    // State
    isInitialized,
    isAuthenticating,
    isConnecting: turnkeyState.isConnecting,
    isConnected: turnkeyState.isConnected,
    address: turnkeyState.address,
    organizationId: turnkeyState.organizationId,
    walletId: turnkeyState.walletId,
    wallets,

    // Actions
    loginWithPasskey,
    loginWithWallet,
    createWallet,
    switchWallet,
    disconnect,
    
    // Utilities
    formatAddress: (addr?: string) => {
      if (!addr) return ''
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    },
  }
}