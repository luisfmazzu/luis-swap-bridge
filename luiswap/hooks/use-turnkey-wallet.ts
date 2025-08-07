'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAuth } from '@/contexts/auth-provider'
import { getAddress } from 'viem'

// Network configuration
interface NetworkConfig {
  id: 'tron' | 'ethereum'
  name: string
  testnet: string
  symbol: string
  decimals: number
  explorerUrl: string
  faucetUrl: string
  rpcUrl: string
  mockPrice: number
}

const NETWORK_CONFIGS: Record<'tron' | 'ethereum', NetworkConfig> = {
  tron: {
    id: 'tron',
    name: 'TRON',
    testnet: 'Shasta Testnet',
    symbol: 'TRX',
    decimals: 6, // 1 TRX = 1,000,000 SUN
    explorerUrl: 'https://shasta.tronscan.org/#/address/',
    faucetUrl: 'https://www.trongrid.io/faucet',
    rpcUrl: 'https://api.shasta.trongrid.io',
    mockPrice: 0.1
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    testnet: 'Sepolia Testnet',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://sepolia.etherscan.io/address/',
    faucetUrl: 'https://sepoliafaucet.com/',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    mockPrice: 3500
  }
}

export interface TurnkeyAccount {
  address: string
  balance?: bigint
  organizationId: string
  walletId: string
  addressFormat: 'ETHEREUM' | 'TRON'
  network: 'tron' | 'ethereum'
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

// Detect network based on address format
function detectNetworkFromAddress(address: string): NetworkConfig {
  // TRON addresses start with 'T' and are base58 encoded
  if (address.startsWith('T') && address.length >= 34) {
    return NETWORK_CONFIGS.tron
  } 
  // Ethereum addresses start with '0x' and are hex encoded
  else if (address.startsWith('0x') && address.length === 42) {
    return NETWORK_CONFIGS.ethereum
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

// Calculate USD value
function calculateUSDValue(balance: bigint, networkConfig: NetworkConfig): number {
  const formattedBalance = formatBalanceForDisplay(balance, networkConfig)
  return parseFloat(formattedBalance) * networkConfig.mockPrice
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
                let address = account.address
                const networkConfig = detectNetworkFromAddress(address)
                
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
                
                console.log('💰 useTurnkeyWallet: Account', address, 'network:', networkConfig.name, 'balance:', balance.toString())
                
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
  } catch (error) {
    console.error('❌ useTurnkeyWallet: Error fetching wallets:', error)
    return []
  }
}

export function useTurnkeyWallet(selectedNetwork?: 'tron' | 'ethereum') {
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
        
        // Safe logging that handles BigInt values
        const walletsForLogging = wallets.map(wallet => ({
          ...wallet,
          accounts: wallet.accounts.map(account => ({
            ...account,
            balance: account.balance?.toString() || '0'
          }))
        }))
        console.log('🔍 useTurnkeyWallet: Wallets data structure:', walletsForLogging)

        // Select first wallet and account by default
        const selectedWallet = wallets.length > 0 ? wallets[0] : null
        const selectedAccount = selectedWallet?.accounts?.length && selectedWallet.accounts.length > 0 ? selectedWallet.accounts[0] : null

        if (selectedWallet) {
          console.log('🔍 useTurnkeyWallet: Selected wallet:', {
            walletId: selectedWallet.walletId,
            walletName: selectedWallet.walletName,
            accountsCount: selectedWallet.accounts.length
          })
        }
        if (selectedAccount) {
          console.log('🔍 useTurnkeyWallet: Selected account:', {
            address: selectedAccount.address,
            network: selectedAccount.network,
            balance: selectedAccount.balance?.toString() || '0'
          })
        }

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

    // If network is overridden, use a mock account for that network
    if (selectedNetwork && selectedNetwork !== state.selectedAccount.network) {
      const networkConfig = NETWORK_CONFIGS[selectedNetwork]
      return {
        walletName: state.selectedWallet.walletName,
        address: selectedNetwork === 'tron' ? 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE' : '0x742d35Cc6634C0532925a3b8D2F4e8F33C6E9f9C',
        balance: BigInt(0), // Show 0 balance for switched networks
        formattedAddress: selectedNetwork === 'tron' ? 'TQn9Y2...bLSE' : '0x742d...9f9C',
        networkConfig,
        network: selectedNetwork
      }
    }

    return {
      walletName: state.selectedWallet.walletName,
      address: state.selectedAccount.address,
      balance: state.selectedAccount.balance || BigInt(0),
      formattedAddress: `${state.selectedAccount.address.slice(0, 6)}...${state.selectedAccount.address.slice(-4)}`,
      networkConfig: state.selectedAccount.networkConfig,
      network: state.selectedAccount.network
    }
  }, [state.selectedWallet, state.selectedAccount, selectedNetwork])

  // Override selected account if network is overridden
  const effectiveAccount = useMemo(() => {
    if (selectedNetwork && selectedNetwork !== state.selectedAccount?.network && state.selectedAccount) {
      const networkConfig = NETWORK_CONFIGS[selectedNetwork]
      return {
        ...state.selectedAccount,
        address: selectedNetwork === 'tron' ? 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE' : '0x742d35Cc6634C0532925a3b8D2F4e8F33C6E9f9C',
        balance: BigInt(0),
        network: selectedNetwork,
        networkConfig,
        addressFormat: selectedNetwork === 'tron' ? 'TRON' : 'ETHEREUM'
      }
    }
    return state.selectedAccount
  }, [state.selectedAccount, selectedNetwork])

  return {
    ...state,
    selectedAccount: effectiveAccount, // Use effective account that considers network override
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

// Export utility functions for components
export { formatBalanceForDisplay, calculateUSDValue, NETWORK_CONFIGS }