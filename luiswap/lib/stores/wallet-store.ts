'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletState, WalletType, WalletError } from '@/types/wallet'

interface WalletStoreActions {
  // Wagmi connection actions
  setWagmiConnection: (address: string, chainId?: number) => void
  setWagmiConnecting: (connecting: boolean) => void
  disconnectWagmi: () => void
  
  // Turnkey connection actions
  setTurnkeyConnection: (address: string, authMethod: 'passkey' | 'email' | 'google' | 'apple' | 'facebook' | 'wallet', chainId?: number) => void
  setTurnkeyConnecting: (connecting: boolean) => void
  disconnectTurnkey: () => void
  
  // General actions
  setActiveConnection: (type: WalletType | null) => void
  disconnectAll: () => void
  
  // Error handling
  setError: (error: WalletError | null) => void
  clearError: () => void
}

interface WalletStore extends WalletState, WalletStoreActions {
  error: WalletError | null
}

const initialState: WalletState & { error: WalletError | null } = {
  wagmi: {
    isConnected: false,
    isConnecting: false,
  },
  turnkey: {
    isConnected: false,
    isConnecting: false,
  },
  activeConnection: null,
  error: null,
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Wagmi actions
      setWagmiConnection: (address: string, chainId?: number) => {
        console.log('🔗 WalletStore: Setting Wagmi connection')
        console.log('🔗 WalletStore: Address:', address)
        console.log('🔗 WalletStore: Chain ID:', chainId)
        set((state) => ({
          wagmi: {
            ...state.wagmi,
            address,
            chainId,
            isConnected: true,
            isConnecting: false,
          },
          activeConnection: 'wagmi',
          error: null,
        }))
        console.log('✅ WalletStore: Wagmi connection set successfully')
      },

      setWagmiConnecting: (connecting: boolean) => {
        console.log('🔄 WalletStore: Setting Wagmi connecting state:', connecting)
        set((state) => ({
          wagmi: {
            ...state.wagmi,
            isConnecting: connecting,
          },
        }))
      },

      disconnectWagmi: () => {
        console.log('❌ WalletStore: Disconnecting Wagmi wallet')
        set((state) => ({
          wagmi: {
            ...state.wagmi,
            address: undefined,
            chainId: undefined,
            isConnected: false,
            isConnecting: false,
          },
          activeConnection: null,
        }))
        console.log('✅ WalletStore: Wagmi wallet disconnected successfully')
      },

      // Turnkey actions
      setTurnkeyConnection: (address: string, authMethod: 'passkey' | 'email' | 'google' | 'apple' | 'facebook' | 'wallet', chainId?: number) => {
        console.log('🔐 WalletStore: Setting Turnkey connection')
        console.log('🔐 WalletStore: Address:', address)
        console.log('🔐 WalletStore: Auth method:', authMethod)
        console.log('🔐 WalletStore: Chain ID:', chainId)
        set((state) => ({
          turnkey: {
            ...state.turnkey,
            address,
            chainId,
            authMethod,
            isConnected: true,
            isConnecting: false,
          },
          activeConnection: 'turnkey',
          error: null,
        }))
        console.log('✅ WalletStore: Turnkey connection set successfully')
        console.log('📊 WalletStore: Current store state:', get())
      },

      setTurnkeyConnecting: (connecting: boolean) => {
        console.log('🔄 WalletStore: Setting Turnkey connecting state:', connecting)
        set((state) => ({
          turnkey: {
            ...state.turnkey,
            isConnecting: connecting,
          },
        }))
      },

      disconnectTurnkey: () => {
        console.log('❌ WalletStore: Disconnecting Turnkey wallet')
        set((state) => ({
          turnkey: {
            ...state.turnkey,
            address: undefined,
            chainId: undefined,
            authMethod: undefined,
            isConnected: false,
            isConnecting: false,
          },
          activeConnection: null,
        }))
        console.log('✅ WalletStore: Turnkey wallet disconnected successfully')
      },

      // General actions
      setActiveConnection: (type: WalletType | null) => {
        console.log('🔄 WalletStore: Setting active connection type:', type)
        set({ activeConnection: type })
      },

      disconnectAll: () => {
        console.log('❌ WalletStore: Disconnecting all wallets')
        set({
          wagmi: {
            isConnected: false,
            isConnecting: false,
          },
          turnkey: {
            isConnected: false,
            isConnecting: false,
          },
          activeConnection: null,
          error: null,
        })
        console.log('✅ WalletStore: All wallets disconnected successfully')
      },

      // Error handling
      setError: (error: WalletError | null) => {
        console.log('❌ WalletStore: Setting wallet error:', error)
        set({ error })
      },

      clearError: () => {
        console.log('✅ WalletStore: Clearing wallet error')
        set({ error: null })
      },
    }),
    {
      name: 'luiswap-wallet-store',
      partialize: (state) => ({
        // Only persist connection state, not loading states
        wagmi: {
          address: state.wagmi.address,
          chainId: state.wagmi.chainId,
          isConnected: state.wagmi.isConnected,
          isConnecting: false, // Reset on reload
        },
        turnkey: {
          address: state.turnkey.address,
          chainId: state.turnkey.chainId,
          authMethod: state.turnkey.authMethod,
          isConnected: state.turnkey.isConnected,
          isConnecting: false, // Reset on reload
        },
        activeConnection: state.activeConnection,
      }),
    }
  )
)

// Derived selectors
export const useActiveWallet = () => {
  const store = useWalletStore()
  
  if (store.activeConnection === 'wagmi') {
    return {
      type: 'wagmi' as const,
      address: store.wagmi.address,
      chainId: store.wagmi.chainId,
      isConnected: store.wagmi.isConnected,
      isConnecting: store.wagmi.isConnecting,
    }
  }
  
  if (store.activeConnection === 'turnkey') {
    return {
      type: 'turnkey' as const,
      address: store.turnkey.address,
      chainId: store.turnkey.chainId,
      authMethod: store.turnkey.authMethod,
      isConnected: store.turnkey.isConnected,
      isConnecting: store.turnkey.isConnecting,
    }
  }
  
  return null
}

export const useIsAnyWalletConnecting = () => {
  const store = useWalletStore()
  return store.wagmi.isConnecting || store.turnkey.isConnecting
}

export const useIsAnyWalletConnected = () => {
  const store = useWalletStore()
  return store.wagmi.isConnected || store.turnkey.isConnected
}