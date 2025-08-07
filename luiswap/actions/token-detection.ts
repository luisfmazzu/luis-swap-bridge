"use server"

import { formatEther, formatUnits, getAddress } from 'viem'

// Define the token interface
export interface DetectedToken {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  rawBalance: bigint
  logoUrl?: string
  isNative: boolean
  network: 'tron' | 'ethereum' | 'celo'
  coingeckoId?: string
}

// Common token addresses and their CoinGecko IDs
const KNOWN_TOKENS = {
  ethereum: {
    // Sepolia testnet USDT contract (example)
    '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether'
    },
    // Add more Sepolia testnet tokens as needed
  },
  celo: {
    // Alfajores testnet cUSD
    '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1': {
      symbol: 'cUSD',
      name: 'Celo Dollar',
      decimals: 18,
      coingeckoId: 'celo-dollar'
    },
    // Alfajores testnet cEUR
    '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F': {
      symbol: 'cEUR', 
      name: 'Celo Euro',
      decimals: 18,
      coingeckoId: 'celo-euro'
    }
  },
  tron: {
    // TRON TRC20 tokens - updated with correct Nile testnet USDT address
    'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      coingeckoId: 'tether'
    }
  }
}

// Detect tokens for Ethereum/CELO networks using Alchemy or RPC calls
async function detectEthereumTokens(address: string, network: 'ethereum' | 'celo'): Promise<DetectedToken[]> {
  const tokens: DetectedToken[] = []

  try {
    console.log(`🔍 Detecting tokens for ${network} address:`, address)

    // Get native token balance first
    const networkConfigs = {
      ethereum: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        coingeckoId: 'ethereum',
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
      },
      celo: {
        symbol: 'CELO',
        name: 'Celo',
        decimals: 18,
        coingeckoId: 'celo',
        rpcUrl: 'https://alfajores-forno.celo-testnet.org'
      }
    }

    const config = networkConfigs[network]

    // Get native token balance
    const nativeBalance = await fetchNativeBalance(address, config.rpcUrl)
    if (nativeBalance > BigInt(0)) {
      tokens.push({
        address: 'native',
        symbol: config.symbol,
        name: config.name,
        decimals: config.decimals,
        balance: formatEther(nativeBalance),
        rawBalance: nativeBalance,
        isNative: true,
        network,
        coingeckoId: config.coingeckoId
      })
    }

    // Check known token contracts for this network
    const knownTokens = KNOWN_TOKENS[network] || {}
    for (const [contractAddress, tokenInfo] of Object.entries(knownTokens)) {
      try {
        const tokenBalance = await fetchTokenBalance(address, contractAddress, config.rpcUrl)
        if (tokenBalance > BigInt(0)) {
          tokens.push({
            address: contractAddress,
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            decimals: tokenInfo.decimals,
            balance: formatUnits(tokenBalance, tokenInfo.decimals),
            rawBalance: tokenBalance,
            isNative: false,
            network,
            coingeckoId: tokenInfo.coingeckoId
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch balance for token ${tokenInfo.symbol}:`, error)
      }
    }

    console.log(`✅ Found ${tokens.length} tokens for ${network}:`, tokens.map(t => t.symbol))
    return tokens

  } catch (error) {
    console.error(`Error detecting ${network} tokens:`, error)
    return []
  }
}

// Detect tokens for TRON network using TronGrid API
async function detectTronTokens(address: string): Promise<DetectedToken[]> {
  const tokens: DetectedToken[] = []

  try {
    console.log('🔍 Detecting TRON tokens for address:', address)

    // Use TronScan API for Nile testnet - confirmed working
    const tronScanApiUrl = 'https://nileapi.tronscan.org'
    
    // Get account information (includes TRX balance and TRC20 tokens)
    const accountResponse = await fetch(`${tronScanApiUrl}/api/account?address=${address}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!accountResponse.ok) {
      console.warn('⚠️ TronScan API request failed:', accountResponse.status, accountResponse.statusText)
      return []
    }

    const accountData = await accountResponse.json()
    
    // Add native TRX if balance exists
    if (accountData.balance !== undefined && accountData.balance > 0) {
      // TRX balance is in SUN (1 TRX = 1,000,000 SUN)
      tokens.push({
        address: 'native',
        symbol: 'TRX',
        name: 'TRON',
        decimals: 6,
        balance: (accountData.balance / 1000000).toString(),
        rawBalance: BigInt(accountData.balance),
        isNative: true,
        network: 'tron',
        coingeckoId: 'tron'
      })
    }

    // Check for TRC20 tokens from trc20token_balances array
    if (accountData.trc20token_balances && Array.isArray(accountData.trc20token_balances)) {
      for (const token of accountData.trc20token_balances) {
        if (token.balance && Number(token.balance) > 0) {
          tokens.push({
            address: token.tokenId,
            symbol: token.tokenAbbr,
            name: token.tokenName,
            decimals: token.tokenDecimal,
            balance: (Number(token.balance) / Math.pow(10, token.tokenDecimal)).toString(),
            rawBalance: BigInt(token.balance),
            isNative: false,
            network: 'tron',
            // Map known tokens to CoinGecko IDs
            coingeckoId: token.tokenAbbr === 'USDT' ? 'tether' : undefined
          })
        }
      }
    }


    console.log(`✅ Found ${tokens.length} TRON tokens:`, tokens.map(t => t.symbol))
    return tokens

  } catch (error) {
    console.error('Error detecting TRON tokens:', error)
    
    // Fallback: Return mock data for development/testing
    console.log('🔄 Using fallback mock data for TRON tokens')
    return [
      {
        address: 'native',
        symbol: 'TRX',
        name: 'TRON',
        decimals: 6,
        balance: '0.0',
        rawBalance: BigInt(0),
        isNative: true,
        network: 'tron',
        coingeckoId: 'tron'
      }
    ]
  }
}

// Helper function to fetch native token balance
async function fetchNativeBalance(address: string, rpcUrl: string): Promise<bigint> {
  try {
    const response = await fetch(rpcUrl, {
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
    console.warn('Failed to fetch native balance:', error)
    return BigInt(0)
  }
}

// Helper function to fetch ERC20 token balance
async function fetchTokenBalance(address: string, contractAddress: string, rpcUrl: string): Promise<bigint> {
  try {
    // ERC20 balanceOf function call
    const functionSelector = '0x70a08231' // balanceOf(address)
    const paddedAddress = address.slice(2).padStart(64, '0')
    const data = functionSelector + paddedAddress

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: data
        }, 'latest'],
        id: 1,
      }),
    })

    const result = await response.json()
    if (result.result && result.result !== '0x') {
      return BigInt(result.result)
    }
    return BigInt(0)
  } catch (error) {
    console.warn('Failed to fetch token balance:', error)
    return BigInt(0)
  }
}

// Main function to detect all tokens in a wallet
export async function detectWalletTokens(address: string, network: 'tron' | 'ethereum' | 'celo'): Promise<DetectedToken[]> {
  try {
    console.log(`🔍 Starting token detection for ${network} address:`, address)

    // Import the enhanced discovery system
    const { discoverWalletTokens } = await import('./token-discovery')
    
    // Try enhanced discovery first
    const enhancedTokens = await discoverWalletTokens(address, network)
    
    if (enhancedTokens.length > 0) {
      console.log(`✅ Enhanced discovery found ${enhancedTokens.length} tokens, using enhanced results`)
      
      // Convert DiscoveredToken to DetectedToken format for compatibility
      return enhancedTokens.map(token => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: token.balance,
        rawBalance: token.rawBalance,
        logoUrl: token.logoUrl,
        isNative: token.isNative,
        network: token.network,
        coingeckoId: token.coingeckoId
      }))
    }

    // Fallback to original detection methods
    console.log(`⚠️ Enhanced discovery found no tokens, falling back to original detection`)
    
    if (network === 'tron') {
      return await detectTronTokens(address)
    } else {
      return await detectEthereumTokens(address, network)
    }
  } catch (error) {
    console.error(`Failed to detect tokens for ${network}:`, error)
    
    // Final fallback to original methods
    try {
      if (network === 'tron') {
        return await detectTronTokens(address)
      } else {
        return await detectEthereumTokens(address, network)
      }
    } catch (fallbackError) {
      console.error(`Fallback detection also failed:`, fallbackError)
      return []
    }
  }
}

