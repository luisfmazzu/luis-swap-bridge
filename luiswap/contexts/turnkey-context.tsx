'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Turnkey } from '@turnkey/sdk-browser'
import { EthereumWallet } from '@turnkey/wallet-stamper'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { toast } from 'sonner'

interface TurnkeyWallet {
  walletId: string
  walletName: string
  accounts: Array<{
    address: string
    curve: string
    pathFormat: string
    path: string
  }>
}

interface TurnkeyContextType {
  turnkey: Turnkey | null
  isInitialized: boolean
  isConnecting: boolean
  error: string | null
  wallets: TurnkeyWallet[]
  activeWallet: TurnkeyWallet | null
  initializeTurnkey: () => Promise<void>
  createWallet: (name: string) => Promise<TurnkeyWallet | null>
  importWallet: (name: string, mnemonic: string) => Promise<TurnkeyWallet | null>
  exportWallet: (walletId: string) => Promise<string | null>
  switchWallet: (walletId: string) => Promise<void>
  refreshWallets: () => Promise<void>
}

const TurnkeyContext = createContext<TurnkeyContextType | undefined>(undefined)

export function useTurnkey() {
  const context = useContext(TurnkeyContext)
  if (context === undefined) {
    throw new Error('useTurnkey must be used within a TurnkeyProvider')
  }
  return context
}

interface TurnkeyProviderProps {
  children: ReactNode
}

export function TurnkeyProvider({ children }: TurnkeyProviderProps) {
  const [turnkey, setTurnkey] = useState<Turnkey | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallets, setWallets] = useState<TurnkeyWallet[]>([])
  const [activeWallet, setActiveWallet] = useState<TurnkeyWallet | null>(null)

  const { connector, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Initialize Turnkey SDK
  const initializeTurnkey = async () => {
    if (turnkey) return

    try {
      setError(null)
      setIsConnecting(true)

      const organizationId = process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID
      if (!organizationId) {
        throw new Error('Turnkey organization ID not configured')
      }

      const turnkeyInstance = new Turnkey({
        apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL || 'https://api.turnkey.com',
        defaultOrganizationId: organizationId,
        serverSignUrl: '/api/turnkey/sign',
      })

      setTurnkey(turnkeyInstance)
      setIsInitialized(true)
      
      // Try to refresh wallets if we have a connection
      if (isConnected && connector?.id === 'turnkey') {
        await refreshWalletsInternal(turnkeyInstance)
      }

      toast.success('Turnkey initialized successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Turnkey'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Turnkey initialization error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  // Create a new wallet
  const createWallet = async (name: string): Promise<TurnkeyWallet | null> => {
    if (!turnkey) {
      toast.error('Turnkey not initialized')
      return null
    }

    try {
      setError(null)
      setIsConnecting(true)

      const walletClient = turnkey.walletClient(new EthereumWallet())
      
      const response = await walletClient.createWallet({
        walletName: name,
        accounts: [
          {
            curve: 'CURVE_SECP256K1',
            pathFormat: 'PATH_FORMAT_BIP32',
            path: "m/44'/60'/0'/0/0",
            addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
          },
        ],
      })

      const newWallet: TurnkeyWallet = {
        walletId: response.walletId,
        walletName: name,
        accounts: response.addresses?.map((address, index) => ({
          address,
          curve: 'CURVE_SECP256K1',
          pathFormat: 'PATH_FORMAT_BIP32',
          path: "m/44'/60'/0'/0/0",
        })) || [],
      }

      await refreshWallets()
      toast.success(`Wallet "${name}" created successfully`)
      return newWallet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Create wallet error:', err)
      return null
    } finally {
      setIsConnecting(false)
    }
  }

  // Import an existing wallet
  const importWallet = async (name: string, mnemonic: string): Promise<TurnkeyWallet | null> => {
    if (!turnkey) {
      toast.error('Turnkey not initialized')
      return null
    }

    try {
      setError(null)
      setIsConnecting(true)

      // This would require iframe integration for secure mnemonic handling
      toast.info('Wallet import requires secure iframe integration')
      
      // For now, we'll create a placeholder wallet
      // In production, you'd use Turnkey's iframe for secure import
      return await createWallet(name)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Import wallet error:', err)
      return null
    } finally {
      setIsConnecting(false)
    }
  }

  // Export a wallet (returns mnemonic)
  const exportWallet = async (walletId: string): Promise<string | null> => {
    if (!turnkey) {
      toast.error('Turnkey not initialized')
      return null
    }

    try {
      setError(null)

      // This would require iframe integration for secure export
      toast.info('Wallet export requires secure iframe integration')
      
      // For now, return a placeholder
      return 'Export functionality requires secure iframe integration'
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Export wallet error:', err)
      return null
    }
  }

  // Switch to a different wallet
  const switchWallet = async (walletId: string): Promise<void> => {
    if (!turnkey) {
      toast.error('Turnkey not initialized')
      return
    }

    try {
      const wallet = wallets.find(w => w.walletId === walletId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }

      setActiveWallet(wallet)
      toast.success(`Switched to wallet: ${wallet.walletName}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch wallet'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Switch wallet error:', err)
    }
  }

  // Internal refresh function
  const refreshWalletsInternal = async (turnkeyInstance: Turnkey) => {
    try {
      const walletClient = turnkeyInstance.walletClient(new EthereumWallet())
      const response = await walletClient.getWallets()

      if (response.wallets) {
        const walletsData: TurnkeyWallet[] = await Promise.all(
          response.wallets.map(async (wallet) => {
            try {
              const accountsResponse = await walletClient.getWalletAccounts({
                organizationId: response.organizationId || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || '',
                walletId: wallet.walletId,
              })

              return {
                walletId: wallet.walletId,
                walletName: wallet.walletName,
                accounts: accountsResponse.accounts || [],
              }
            } catch (err) {
              console.error(`Failed to get accounts for wallet ${wallet.walletId}:`, err)
              return {
                walletId: wallet.walletId,
                walletName: wallet.walletName,
                accounts: [],
              }
            }
          })
        )

        setWallets(walletsData)
        
        // Set active wallet if none selected
        if (!activeWallet && walletsData.length > 0) {
          setActiveWallet(walletsData[0])
        }
      }
    } catch (err) {
      console.error('Refresh wallets error:', err)
    }
  }

  // Refresh wallets list
  const refreshWallets = async (): Promise<void> => {
    if (!turnkey) {
      toast.error('Turnkey not initialized')
      return
    }

    await refreshWalletsInternal(turnkey)
  }

  // Auto-initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !turnkey) {
      initializeTurnkey()
    }
  }, [])

  // Watch for Turnkey connector connection
  useEffect(() => {
    if (isConnected && connector?.id === 'turnkey' && turnkey) {
      refreshWallets()
    }
  }, [isConnected, connector?.id, turnkey])

  const value: TurnkeyContextType = {
    turnkey,
    isInitialized,
    isConnecting,
    error,
    wallets,
    activeWallet,
    initializeTurnkey,
    createWallet,
    importWallet,
    exportWallet,
    switchWallet,
    refreshWallets,
  }

  return (
    <TurnkeyContext.Provider value={value}>
      {children}
    </TurnkeyContext.Provider>
  )
}