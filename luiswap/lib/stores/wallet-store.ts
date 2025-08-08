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
      },

      setWagmiConnecting: (connecting: boolean) => {
        set((state) => ({
          wagmi: {
            ...state.wagmi,
            isConnecting: connecting,
          },
        }))
      },

      disconnectWagmi: () => {
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
      },

      // Turnkey actions
      setTurnkeyConnection: (address: string, authMethod: 'passkey' | 'email' | 'google' | 'apple' | 'facebook' | 'wallet', chainId?: number) => {
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
      },

      setTurnkeyConnecting: (connecting: boolean) => {
        set((state) => ({
          turnkey: {
            ...state.turnkey,
            isConnecting: connecting,
          },
        }))
      },

      disconnectTurnkey: () => {
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
      },

      // General actions
      setActiveConnection: (type: WalletType | null) => {
        set({ activeConnection: type })
      },

      disconnectAll: () => {
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
      },

      // Error handling
      setError: (error: WalletError | null) => {
        set({ error })
      },

      clearError: () => {
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