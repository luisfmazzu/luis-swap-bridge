'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAuth } from '@/contexts/auth-provider'
import { getAddress } from 'viem'

export interface TurnkeyAccount {
  address: string
  balance?: bigint
  organizationId: string
  walletId: string
  addressFormat: 'ETHEREUM'
}

export interface TurnkeyWallet {
  walletId: string
  walletName: string
  accounts: TurnkeyAccount[]
}

interface TurnkeyWalletState {
  loading: boolean
  error: string | null
  wallets: TurnkeyWallet[]
  selectedWallet: TurnkeyWallet | null
  selectedAccount: TurnkeyAccount | null
}

// Mock balance fetching - in production you'd use a real provider
async function getBalance(address: string): Promise<bigint> {
  try {
    // Using fetch to get balance from a public Ethereum RPC
    const response = await fetch('https://ethereum-sepolia-rpc.publicnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    })
    
    const data = await response.json()
    if (data.result) {
      return BigInt(data.result)
    }
    return BigInt(0)
  } catch (error) {
    console.warn('Failed to fetch balance for', address, error)
    return BigInt(0)
  }
}

async function getWalletsWithAccounts(
  indexedDbClient: any,
  organizationId: string
): Promise<TurnkeyWallet[]> {
  try {
    console.log('🔍 useTurnkeyWallet: Fetching wallets for org:', organizationId)
    
    const { wallets } = await indexedDbClient.getWallets()
    console.log('🔍 useTurnkeyWallet: Found wallets:', wallets.length)
    
    return await Promise.all(
      wallets.map(async (wallet: any) => {
        try {
          const { accounts } = await indexedDbClient.getWalletAccounts({
            walletId: wallet.walletId,
          })

          console.log('🔍 useTurnkeyWallet: Wallet', wallet.walletName, 'has accounts:', accounts.length)

          const accountsWithBalance = await Promise.all(
            accounts.map(async (account: any) => {
              if (account.organizationId === organizationId) {
                const address = getAddress(account.address)
                const balance = await getBalance(address)
                
                console.log('💰 useTurnkeyWallet: Account', address, 'balance:', balance.toString())
                
                return {
                  ...account,
                  address,
                  balance,
                }
              }
              return null
            }).filter(Boolean)
          )

          return { 
            ...wallet, 
            accounts: accountsWithBalance.filter(Boolean) 
          }
        } catch (error) {
          console.error('❌ useTurnkeyWallet: Error fetching accounts for wallet:', wallet.walletId, error)
          return { ...wallet, accounts: [] }
        }
      })
    )
  } catch (error) {
    console.error('❌ useTurnkeyWallet: Error fetching wallets:', error)
    return []
  }
}

export function useTurnkeyWallet() {
  const { indexedDbClient } = useTurnkey()
  const { user } = useAuth()
  
  const [state, setState] = useState<TurnkeyWalletState>({
    loading: false,
    error: null,
    wallets: [],
    selectedWallet: null,
    selectedAccount: null,
  })

  // Fetch wallets when user and indexedDbClient are available
  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.organization?.organizationId || !indexedDbClient) {
        console.log('🔍 useTurnkeyWallet: Missing requirements - user org:', !!user?.organization?.organizationId, 'client:', !!indexedDbClient)
        return
      }

      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        console.log('🔍 useTurnkeyWallet: Starting wallet fetch for user:', user.email)
        
        const wallets = await getWalletsWithAccounts(
          indexedDbClient,
          user.organization.organizationId
        )

        console.log('✅ useTurnkeyWallet: Fetched wallets successfully:', wallets.length)

        // Select first wallet and account by default
        const selectedWallet = wallets.length > 0 ? wallets[0] : null
        const selectedAccount = selectedWallet?.accounts.length > 0 ? selectedWallet.accounts[0] : null

        setState(prev => ({
          ...prev,
          loading: false,
          wallets,
          selectedWallet,
          selectedAccount,
        }))
      } catch (error) {
        console.error('❌ useTurnkeyWallet: Error fetching wallets:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch wallets',
        }))
      }
    }

    fetchWallets()
  }, [user?.organization?.organizationId, indexedDbClient, user?.email])

  // Memoized wallet info for display
  const walletInfo = useMemo(() => {
    if (!state.selectedAccount || !state.selectedWallet) {
      return null
    }

    return {
      walletName: state.selectedWallet.walletName,
      address: state.selectedAccount.address,
      balance: state.selectedAccount.balance || BigInt(0),
      formattedAddress: `${state.selectedAccount.address.slice(0, 6)}...${state.selectedAccount.address.slice(-4)}`,
    }
  }, [state.selectedWallet, state.selectedAccount])

  return {
    ...state,
    walletInfo,
    hasWallet: !!state.selectedWallet,
    selectWallet: (wallet: TurnkeyWallet) => {
      setState(prev => ({
        ...prev,
        selectedWallet: wallet,
        selectedAccount: wallet.accounts.length > 0 ? wallet.accounts[0] : null,
      }))
    },
    selectAccount: (account: TurnkeyAccount) => {
      setState(prev => ({ ...prev, selectedAccount: account }))
    },
  }
}