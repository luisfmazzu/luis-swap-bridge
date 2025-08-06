'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Turnkey } from '@turnkey/sdk-browser'
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
  accounts: Array<{
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
        apiBaseUrl: process.env.TURNKEY_API_BASE_URL || 'https://api.turnkey.com',
        defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
        rpId: process.env.TURNKEY_RP_ID || 'localhost',
        serverSignUrl: process.env.TURNKEY_SERVER_SIGN_URL,
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
        iframeUrl: process.env.TURNKEY_IFRAME_URL || 'https://auth.turnkey.com',
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
      
      setWallets(userWallets)

      // If user has wallets, connect with the first one
      if (userWallets.length > 0) {
        const primaryWallet = userWallets[0]
        const primaryAccount = primaryWallet.accounts?.[0]
        
        if (primaryAccount) {
          setTurnkeyConnection(
            primaryAccount.address,
            configRef.current?.defaultOrganizationId || '',
            primaryWallet.walletId,
            1 // Default to Ethereum mainnet, can be updated later
          )
        }
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
        sessionType: 'READ_WRITE',
        iframeClient: iframeClientRef.current,
        expirationSeconds: '3600', // 1 hour
      })

      // Get user wallets after successful authentication
      const walletsResponse = await walletClient.getWallets()
      const userWallets = walletsResponse?.wallets || []
      
      setWallets(userWallets)

      // If user has wallets, connect with the first one
      if (userWallets.length > 0) {
        const primaryWallet = userWallets[0]
        const primaryAccount = primaryWallet.accounts?.[0]
        
        if (primaryAccount) {
          setTurnkeyConnection(
            primaryAccount.address,
            configRef.current?.defaultOrganizationId || '',
            primaryWallet.walletId,
            1 // Default to Ethereum mainnet
          )
        }
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
      setWallets(userWallets)

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

    const primaryAccount = wallet.accounts?.[0]
    if (!primaryAccount) {
      throw new Error('No accounts found in wallet')
    }

    setTurnkeyConnection(
      primaryAccount.address,
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