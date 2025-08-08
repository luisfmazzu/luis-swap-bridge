'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAuth } from '@/contexts/auth-provider'
import { useUser } from './use-user'
import { getAddress } from 'viem'
import { useTokenPrices } from './use-token-prices'

// Network configuration
interface NetworkConfig {
  id: 'tron' | 'ethereum' | 'celo'
  name: string
  testnet: string
  symbol: string
  decimals: number
  explorerUrl: string
  faucetUrl: string
  rpcUrl: string
}

const NETWORK_CONFIGS: Record<'tron' | 'ethereum' | 'celo', NetworkConfig> = {
  tron: {
    id: 'tron',
    name: 'TRON',
    testnet: 'Nile Testnet',
    symbol: 'TRX',
    decimals: 6, // 1 TRX = 1,000,000 SUN
    explorerUrl: 'https://nile.tronscan.org/#/address/',
    faucetUrl: 'https://nileex.io/join/getJoinPage',
    rpcUrl: 'https://nile.trongrid.io' // TronGrid API - more reliable than nileex.io
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    testnet: 'Sepolia Testnet',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://sepolia.etherscan.io/address/',
    faucetUrl: 'https://sepolia-faucet.pk910.de/',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
  },
  celo: {
    id: 'celo',
    name: 'Celo',
    testnet: 'Alfajores Testnet',
    symbol: 'CELO',
    decimals: 18,
    explorerUrl: 'https://alfajores.celoscan.io/address/',
    faucetUrl: 'https://faucet.celo.org/alfajores',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  }
}

export interface TurnkeyAccount {
  address: string
  balance?: bigint
  organizationId: string
  walletId: string
  addressFormat: 'ETHEREUM' | 'TRON'
  network: 'tron' | 'ethereum' | 'celo'
  networkConfig: NetworkConfig
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

// Detect network based on address format and account path
function detectNetworkFromAccount(account: any): NetworkConfig {
  const address = account.address
  const path = account.path
  
  // TRON addresses start with 'T' and are base58 encoded
  if (address.startsWith('T') && address.length >= 34) {
    return NETWORK_CONFIGS.tron
  }
  // For 0x addresses, differentiate by derivation path
  else if (address.startsWith('0x') && address.length === 42) {
    // CELO uses coin type 52752 (m/44'/52752'/...)
    if (path && path.includes("52752")) {
      return NETWORK_CONFIGS.celo
    }
    // Ethereum uses coin type 60 (m/44'/60'/...)
    else {
      return NETWORK_CONFIGS.ethereum
    }
  }
  // Default to ethereum
  return NETWORK_CONFIGS.ethereum
}

// Generic balance fetching based on network config
async function fetchNetworkBalance(address: string, networkConfig: NetworkConfig): Promise<bigint> {
  try {
    if (networkConfig.id === 'tron') {
      // TRON balance fetching
      const response = await fetch(`${networkConfig.rpcUrl}/wallet/getaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          visible: true,
        }),
      })
      
      const data = await response.json()
      if (data.balance) {
        return BigInt(data.balance)
      }
      return BigInt(0)
    } else {
      // Ethereum balance fetching
      const response = await fetch(networkConfig.rpcUrl, {
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
    }
  } catch (error) {
    console.warn(`Failed to fetch ${networkConfig.name} balance for`, address, error)
    return BigInt(0)
  }
}

// Format balance for display based on network
function formatBalanceForDisplay(balance: bigint, networkConfig: NetworkConfig): string {
  if (networkConfig.id === 'tron') {
    // Convert from SUN to TRX
    const divisor = BigInt(10 ** networkConfig.decimals)
    return (Number(balance) / Number(divisor)).toFixed(6)
  } else {
    // Convert from wei to ETH using viem
    const { formatEther } = require('viem')
    return parseFloat(Number(formatEther(balance)).toFixed(8)).toString()
  }
}

// Calculate USD value - now requires price to be passed in
function calculateUSDValue(balance: bigint, networkConfig: NetworkConfig, price: number): number {
  const formattedBalance = formatBalanceForDisplay(balance, networkConfig)
  return parseFloat(formattedBalance) * price
}

// Session storage helper functions
function getWalletsFromCache(organizationId: string): TurnkeyWallet[] | null {
  try {
    const cacheKey = `turnkey_wallets_${organizationId}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const data = JSON.parse(cached)
      // Check if cache is less than 5 minutes old
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data.wallets.map((wallet: any) => ({
          ...wallet,
          accounts: wallet.accounts.map((account: any) => ({
            ...account,
            balance: account.balance ? BigInt(account.balance) : BigInt(0)
          }))
        }))
      }
    }
  } catch (error) {
    console.warn('Error reading wallets from cache:', error)
  }
  return null
}

function saveWalletsToCache(organizationId: string, wallets: TurnkeyWallet[]): void {
  try {
    const cacheKey = `turnkey_wallets_${organizationId}`
    const cacheData = {
      timestamp: Date.now(),
      wallets: wallets.map(wallet => ({
        ...wallet,
        accounts: wallet.accounts.map(account => ({
          ...account,
          balance: account.balance?.toString() // Convert BigInt to string for serialization
        }))
      }))
    }
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Error saving wallets to cache:', error)
  }
}

async function getWalletsWithAccounts(
  indexedDbClient: any,
  organizationId: string
): Promise<TurnkeyWallet[]> {
  // First, try to get from cache
  const cachedWallets = getWalletsFromCache(organizationId)
  if (cachedWallets) {
    return cachedWallets
  }

  try {
    const { wallets } = await indexedDbClient.getWallets()
    
    const walletsWithAccounts = await Promise.all(
      wallets.map(async (wallet: any) => {
        try {
          const { accounts } = await indexedDbClient.getWalletAccounts({
            walletId: wallet.walletId,
          })


          const accountsWithBalance = await Promise.all(
            accounts.map(async (account: any) => {
              if (account.organizationId === organizationId) {
                let address = account.address
                const networkConfig = detectNetworkFromAccount(account)
                
                // Only use viem's getAddress for Ethereum addresses
                if (networkConfig.id === 'ethereum') {
                  try {
                    address = getAddress(account.address)
                  } catch (error) {
                    console.warn('⚠️ useTurnkeyWallet: Invalid Ethereum address format:', account.address)
                    address = account.address // Keep original if getAddress fails
                  }
                }
                
                const balance = await fetchNetworkBalance(address, networkConfig)
                
                
                return {
                  ...account,
                  address,
                  balance,
                  network: networkConfig.id,
                  networkConfig,
                  addressFormat: networkConfig.id === 'tron' ? 'TRON' : 'ETHEREUM',
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

    // Save successful result to cache
    saveWalletsToCache(organizationId, walletsWithAccounts)
    return walletsWithAccounts
  } catch (error) {
    console.error('❌ useTurnkeyWallet: Error fetching wallets:', error)
    
    // On error, try to return cached data even if expired
    const fallbackCache = getWalletsFromCache(organizationId)
    if (fallbackCache) {
      console.warn('⚠️ Using cached wallet data due to API error')
      return fallbackCache
    }
    
    // If no cache available, try to get expired cache
    try {
      const cacheKey = `turnkey_wallets_${organizationId}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)
        console.warn('⚠️ Using expired cached wallet data due to API error')
        return data.wallets.map((wallet: any) => ({
          ...wallet,
          accounts: wallet.accounts.map((account: any) => ({
            ...account,
            balance: account.balance ? BigInt(account.balance) : BigInt(0)
          }))
        }))
      }
    } catch (cacheError) {
      console.warn('Error reading expired cache:', cacheError)
    }
    
    return []
  }
}

export function useTurnkeyWallet(selectedNetwork?: 'tron' | 'ethereum' | 'celo') {
  const { indexedDbClient } = useTurnkey()
  const { state: authState } = useAuth()
  const { user } = authState
  const { prices, loading: pricesLoading } = useTokenPrices()
  
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
        return
      }

      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const wallets = await getWalletsWithAccounts(
          indexedDbClient,
          user.organization.organizationId
        )

        // Select first wallet and account by default
        const selectedWallet = wallets.length > 0 ? wallets[0] : null
        const selectedAccount = selectedWallet?.accounts?.length && selectedWallet.accounts.length > 0 ? selectedWallet.accounts[0] : null


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

    // If network is overridden, find the actual account for that network
    if (selectedNetwork && selectedNetwork !== state.selectedAccount.network) {
      // Look for an existing account in the selected network
      const networkAccount = state.selectedWallet.accounts.find(
        account => account.network === selectedNetwork
      )
      
      if (networkAccount) {
        const currentPrice = prices[networkAccount.network] || 0
        return {
          walletName: state.selectedWallet.walletName,
          address: networkAccount.address,
          balance: networkAccount.balance || BigInt(0),
          formattedAddress: `${networkAccount.address.slice(0, 6)}...${networkAccount.address.slice(-4)}`,
          networkConfig: networkAccount.networkConfig,
          network: networkAccount.network,
          usdValue: calculateUSDValue(networkAccount.balance || BigInt(0), networkAccount.networkConfig, currentPrice)
        }
      } else {
        // If no account exists for the selected network, return null
        // This will show a message that the user needs to create an account for this network
        return null
      }
    }

    const currentPrice = prices[state.selectedAccount.network] || 0
    return {
      walletName: state.selectedWallet.walletName,
      address: state.selectedAccount.address,
      balance: state.selectedAccount.balance || BigInt(0),
      formattedAddress: `${state.selectedAccount.address.slice(0, 6)}...${state.selectedAccount.address.slice(-4)}`,
      networkConfig: state.selectedAccount.networkConfig,
      network: state.selectedAccount.network,
      usdValue: calculateUSDValue(state.selectedAccount.balance || BigInt(0), state.selectedAccount.networkConfig, currentPrice)
    }
  }, [state.selectedWallet, state.selectedAccount, selectedNetwork, prices])

  // Override selected account if network is overridden
  const effectiveAccount = useMemo(() => {
    if (selectedNetwork && selectedNetwork !== state.selectedAccount?.network && state.selectedWallet) {
      // Find the actual account for the selected network
      const networkAccount = state.selectedWallet.accounts.find(
        account => account.network === selectedNetwork
      )
      return networkAccount || state.selectedAccount
    }
    return state.selectedAccount
  }, [state.selectedAccount, selectedNetwork, state.selectedWallet])

  return {
    ...state,
    loading: state.loading || pricesLoading, // Include prices loading state
    selectedAccount: effectiveAccount, // Use effective account that considers network override
    walletInfo,
    hasWallet: !!state.selectedWallet,
    prices,
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

// Export utility functions for components
export { formatBalanceForDisplay, calculateUSDValue, NETWORK_CONFIGS }