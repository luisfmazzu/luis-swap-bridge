"use server"

import { formatEther, formatUnits, getAddress, isAddress } from 'viem'

// Enhanced token interface with discovery metadata
export interface DiscoveredToken {
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
  discoveryMethod: 'native' | 'api' | 'contract' | 'registry' | 'alchemy'
  verified?: boolean
  contractType?: 'ERC20' | 'TRC20' | 'NATIVE'
}

// Token metadata cache to avoid repeated contract calls
const tokenMetadataCache = new Map<string, {
  symbol: string
  name: string
  decimals: number
  coingeckoId?: string
  timestamp: number
}>()

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get cached token metadata or fetch from contract
async function getTokenMetadata(
  contractAddress: string,
  network: 'ethereum' | 'celo',
  rpcUrl: string
): Promise<{ symbol: string; name: string; decimals: number; coingeckoId?: string } | null> {
  const cacheKey = `${network}:${contractAddress}`
  const cached = tokenMetadataCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached
  }

  try {
    console.log(`🔍 Fetching token metadata for ${contractAddress} on ${network}`)
    
    // ERC20 function selectors
    const SYMBOL_SELECTOR = '0x95d89b41' // symbol()
    const NAME_SELECTOR = '0x06fdde03'   // name()
    const DECIMALS_SELECTOR = '0x313ce567' // decimals()

    // Parallel contract calls for efficiency
    const [symbolResponse, nameResponse, decimalsResponse] = await Promise.all([
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: SYMBOL_SELECTOR }, 'latest'],
          id: 1,
        }),
      }),
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: NAME_SELECTOR }, 'latest'],
          id: 2,
        }),
      }),
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: DECIMALS_SELECTOR }, 'latest'],
          id: 3,
        }),
      }),
    ])

    const [symbolData, nameData, decimalsData] = await Promise.all([
      symbolResponse.json(),
      nameResponse.json(),
      decimalsResponse.json(),
    ])

    // Parse responses
    const symbol = parseStringFromHex(symbolData.result) || 'UNKNOWN'
    const name = parseStringFromHex(nameData.result) || 'Unknown Token'
    const decimals = decimalsData.result ? parseInt(decimalsData.result, 16) : 18

    // Try to guess CoinGecko ID from symbol
    const coingeckoId = guessCoinGeckoId(symbol)

    const metadata = { symbol, name, decimals, coingeckoId, timestamp: Date.now() }
    tokenMetadataCache.set(cacheKey, metadata)

    console.log(`✅ Fetched metadata for ${contractAddress}: ${symbol} (${name})`)
    return metadata
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${contractAddress}:`, error)
    return null
  }
}

// Parse string from hex response (handles both string32 and dynamic string encoding)
function parseStringFromHex(hex: string): string | null {
  if (!hex || hex === '0x') return null

  try {
    // Remove 0x prefix
    const cleanHex = hex.slice(2)
    
    // Try dynamic string first (check if length is encoded)
    if (cleanHex.length >= 128) {
      const lengthHex = cleanHex.slice(64, 128)
      const length = parseInt(lengthHex, 16)
      if (length > 0 && length < 100) {
        const stringHex = cleanHex.slice(128, 128 + length * 2)
        return Buffer.from(stringHex, 'hex').toString('utf8').replace(/\0/g, '')
      }
    }

    // Try string32 format (fixed-length)
    if (cleanHex.length === 64) {
      const decoded = Buffer.from(cleanHex, 'hex').toString('utf8').replace(/\0/g, '')
      if (decoded.length > 0) return decoded
    }

    return null
  } catch (error) {
    return null
  }
}

// Guess CoinGecko ID from token symbol
function guessCoinGeckoId(symbol: string): string | undefined {
  const commonMappings: Record<string, string> = {
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'WETH': 'weth',
    'WBTC': 'wrapped-bitcoin',
    'UNI': 'uniswap',
    'LINK': 'chainlink',
    'AAVE': 'aave',
    'COMP': 'compound-governance-token',
    'MKR': 'maker',
    'SNX': 'havven',
    'CRV': 'curve-dao-token',
    'YFI': 'yearn-finance',
    'SUSHI': 'sushi',
    'GRT': 'the-graph',
    // Celo specific
    'cUSD': 'celo-dollar',
    'cEUR': 'celo-euro',
    'CELO': 'celo',
  }
  
  return commonMappings[symbol.toUpperCase()]
}

// Enhanced Alchemy-based token discovery for Ethereum/Celo
async function discoverEthereumTokensViaAlchemy(
  address: string,
  network: 'ethereum' | 'celo'
): Promise<DiscoveredToken[]> {
  const tokens: DiscoveredToken[] = []

  try {
    // Note: This would require Alchemy API key from environment
    const alchemyApiKey = process.env.ALCHEMY_API_KEY
    if (!alchemyApiKey) {
      console.warn('No Alchemy API key found, skipping Alchemy token discovery')
      return []
    }

    const baseUrls = {
      ethereum: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      celo: null, // Alchemy doesn't support Celo, fallback to RPC
    }

    const alchemyUrl = baseUrls[network]
    if (!alchemyUrl) {
      console.log(`Alchemy not supported for ${network}, using RPC fallback`)
      return []
    }

    // Use Alchemy's getTokenBalances method
    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [address],
        id: 1,
      }),
    })

    const data = await response.json()

    if (data.result && data.result.tokenBalances) {
      console.log(`🔍 Found ${data.result.tokenBalances.length} token balances via Alchemy`)

      for (const tokenBalance of data.result.tokenBalances) {
        const { contractAddress, tokenBalance: balance } = tokenBalance

        if (!balance || balance === '0x0') continue

        // Fetch token metadata
        const networkConfig = {
          ethereum: { rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com' },
          celo: { rpcUrl: 'https://alfajores-forno.celo-testnet.org' },
        }

        const metadata = await getTokenMetadata(
          contractAddress,
          network,
          networkConfig[network].rpcUrl
        )

        if (metadata) {
          const rawBalance = BigInt(balance)
          const formattedBalance = formatUnits(rawBalance, metadata.decimals)

          tokens.push({
            address: getAddress(contractAddress),
            symbol: metadata.symbol,
            name: metadata.name,
            decimals: metadata.decimals,
            balance: formattedBalance,
            rawBalance,
            isNative: false,
            network,
            coingeckoId: metadata.coingeckoId,
            discoveryMethod: 'alchemy',
            verified: true,
            contractType: 'ERC20'
          })
        }
      }
    }
  } catch (error) {
    console.warn('Alchemy token discovery failed:', error)
  }

  return tokens
}

// Enhanced TRON token discovery with automatic detection
async function discoverTronTokensExtended(address: string): Promise<DiscoveredToken[]> {
  const tokens: DiscoveredToken[] = []

  try {
    console.log('🔍 Enhanced TRON token discovery for:', address)

    // Use TronScan API - confirmed working for Nile testnet
    const tronScanApiUrl = 'https://nileapi.tronscan.org'
    
    // Get comprehensive account information
    const [accountResponse, transactionsResponse] = await Promise.all([
      fetch(`${tronScanApiUrl}/api/account?address=${address}`, {
        headers: { 'Accept': 'application/json' },
      }),
      // Get transaction history to discover more tokens
      fetch(`${tronScanApiUrl}/api/transaction?sort=-timestamp&count=true&limit=50&start=0&address=${address}`, {
        headers: { 'Accept': 'application/json' },
      }).catch(() => null), // Non-critical, allow to fail
    ])

    // Process account data for native TRX and TRC20 tokens
    if (accountResponse.ok) {
      const accountData = await accountResponse.json()
      
      // Add native TRX
      if (accountData.balance !== undefined && accountData.balance > 0) {
        tokens.push({
          address: 'native',
          symbol: 'TRX',
          name: 'TRON',
          decimals: 6,
          balance: (accountData.balance / 1000000).toString(),
          rawBalance: BigInt(accountData.balance),
          isNative: true,
          network: 'tron',
          coingeckoId: 'tron',
          discoveryMethod: 'api',
          verified: true,
          contractType: 'NATIVE'
        })
      }

      // Process TRC20 tokens from trc20token_balances array (TronScan API format)
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
              coingeckoId: token.tokenAbbr === 'USDT' ? 'tether' : undefined,
              discoveryMethod: 'api',
              verified: true,
              contractType: 'TRC20'
            })
          }
        }
      }
    }

    // Enhanced token discovery from transaction history (if available)
    if (transactionsResponse && transactionsResponse.ok) {
      try {
        const transactionData = await transactionsResponse.json()
        
        if (transactionData.data && Array.isArray(transactionData.data)) {
          const uniqueTokens = new Set<string>()
          
          // Extract unique token contracts from recent TRC20 transactions
          for (const tx of transactionData.data) {
            if (tx.contractType === 'trc20' && tx.tokenInfo && tx.tokenInfo.tokenId) {
              uniqueTokens.add(tx.tokenInfo.tokenId)
            }
          }

          console.log(`🔍 Found ${uniqueTokens.size} unique tokens from transaction history`)

          // For tokens found in history but not in current balances, 
          // they might have zero balance now, so we skip additional checking
          // The TronScan API account endpoint already gives us all current balances
        }
      } catch (error) {
        console.warn('Failed to process transaction history:', error)
      }
    }

    console.log(`✅ Enhanced TRON discovery found ${tokens.length} tokens`)
    return tokens

  } catch (error) {
    console.error('Enhanced TRON token discovery failed:', error)
    return []
  }
}

// Get TRON token metadata from TronGrid
async function getTronTokenMetadata(contractAddress: string): Promise<{
  symbol: string
  name: string
  decimals: number
  coingeckoId?: string
} | null> {
  try {
    const response = await fetch(`https://nile.trongrid.io/v1/contracts/${contractAddress}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const contract = data.data[0]
        
        const symbol = contract.token_info?.symbol || 'UNKNOWN'
        const name = contract.token_info?.name || 'Unknown Token'
        const decimals = contract.token_info?.decimals || 6
        const coingeckoId = guessCoinGeckoId(symbol)

        return { symbol, name, decimals, coingeckoId }
      }
    }

    // Fallback to known tokens
    const knownTokens: Record<string, any> = {
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': {
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        coingeckoId: 'tether'
      },
    }

    return knownTokens[contractAddress] || null

  } catch (error) {
    console.warn(`Failed to get TRON token metadata for ${contractAddress}:`, error)
    return null
  }
}

// Get TRON token balance via contract call
async function getTronTokenBalance(walletAddress: string, contractAddress: string): Promise<number> {
  try {
    const response = await fetch('https://nile.trongrid.io/wallet/triggerconstantcontract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: walletAddress,
        contract_address: contractAddress,
        function_selector: 'balanceOf(address)',
        parameter: walletAddress.replace(/^0x/, '').replace(/^T/, '41').padStart(64, '0'),
        visible: true,
      }),
    })

    const data = await response.json()
    
    if (data.constant_result && data.constant_result.length > 0) {
      const balanceHex = data.constant_result[0]
      return parseInt(balanceHex, 16)
    }

    return 0
  } catch (error) {
    console.warn('Failed to get TRON token balance:', error)
    return 0
  }
}

// Get native token balance for Ethereum/Celo
async function getNativeTokenBalance(
  address: string,
  network: 'ethereum' | 'celo'
): Promise<DiscoveredToken[]> {
  const tokens: DiscoveredToken[] = []

  try {
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
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    })

    const data = await response.json()
    
    if (data.result) {
      const rawBalance = BigInt(data.result)
      if (rawBalance > BigInt(0)) {
        tokens.push({
          address: 'native',
          symbol: config.symbol,
          name: config.name,
          decimals: config.decimals,
          balance: formatEther(rawBalance),
          rawBalance,
          isNative: true,
          network,
          coingeckoId: config.coingeckoId,
          discoveryMethod: 'native',
          verified: true,
          contractType: 'NATIVE'
        })
      }
    }
  } catch (error) {
    console.warn(`Failed to get native token balance for ${network}:`, error)
  }

  return tokens
}

// Main enhanced token discovery function
export async function discoverWalletTokens(
  address: string,
  network: 'tron' | 'ethereum' | 'celo'
): Promise<DiscoveredToken[]> {
  try {
    console.log(`🚀 Starting enhanced token discovery for ${network} address:`, address)

    let discoveredTokens: DiscoveredToken[] = []

    if (network === 'tron') {
      discoveredTokens = await discoverTronTokensExtended(address)
    } else {
      // Always check native ETH balance first
      const nativeTokens = await getNativeTokenBalance(address, network)
      
      // Try Alchemy first for better ERC20 token discovery
      const alchemyTokens = await discoverEthereumTokensViaAlchemy(address, network)
      
      if (alchemyTokens.length > 0) {
        // Combine native ETH with Alchemy ERC20 tokens
        discoveredTokens = [...nativeTokens, ...alchemyTokens]
      } else {
        // Fallback to RPC-based discovery (includes native + well-known tokens)
        discoveredTokens = await discoverEthereumTokensViaRPC(address, network)
      }
    }

    // Sort tokens: native first, then by USD value (if available), then by symbol
    discoveredTokens.sort((a, b) => {
      if (a.isNative && !b.isNative) return -1
      if (!a.isNative && b.isNative) return 1
      return a.symbol.localeCompare(b.symbol)
    })

    console.log(`✅ Enhanced discovery found ${discoveredTokens.length} tokens:`, 
      discoveredTokens.map(t => `${t.symbol} (${t.discoveryMethod})`)
    )

    return discoveredTokens

  } catch (error) {
    console.error(`Enhanced token discovery failed for ${network}:`, error)
    return []
  }
}

// RPC-based discovery fallback for Ethereum/Celo
async function discoverEthereumTokensViaRPC(
  address: string,
  network: 'ethereum' | 'celo'
): Promise<DiscoveredToken[]> {
  const tokens: DiscoveredToken[] = []

  try {
    // Include native token balance
    const nativeTokens = await getNativeTokenBalance(address, network)
    tokens.push(...nativeTokens)

    const networkConfigs = {
      ethereum: {
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
      },
      celo: {
        rpcUrl: 'https://alfajores-forno.celo-testnet.org'
      }
    }

    const config = networkConfigs[network]

    // For now, we'll use a minimal set of well-known tokens
    // In production, this could be expanded with token lists or APIs
    const wellKnownTokens = {
      ethereum: [
        { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', symbol: 'USDC' },
        { address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', symbol: 'WETH' },
      ],
      celo: [
        { address: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B', symbol: 'USDC' }, // Real USDC
        { address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', symbol: 'cUSD' },
        { address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F', symbol: 'cEUR' },
        { address: '0xBba91F588d031469ABCCA566FE80fB1Ad8Ee3287', symbol: 'USDT' }, // Celo Alfajores USDT
      ]
    }

    // Check well-known tokens
    for (const tokenInfo of wellKnownTokens[network]) {
      try {
        const balance = await getERC20Balance(address, tokenInfo.address, config.rpcUrl)
        if (balance > BigInt(0)) {
          const metadata = await getTokenMetadata(tokenInfo.address, network, config.rpcUrl)
          if (metadata) {
            tokens.push({
              address: getAddress(tokenInfo.address),
              symbol: metadata.symbol,
              name: metadata.name,
              decimals: metadata.decimals,
              balance: formatUnits(balance, metadata.decimals),
              rawBalance: balance,
              isNative: false,
              network,
              coingeckoId: metadata.coingeckoId,
              discoveryMethod: 'registry',
              verified: true,
              contractType: 'ERC20'
            })
          }
        }
      } catch (error) {
        console.warn(`Failed to check token ${tokenInfo.symbol}:`, error)
      }
    }

    return tokens

  } catch (error) {
    console.error('RPC-based token discovery failed:', error)
    return []
  }
}

// Get ERC20 token balance
async function getERC20Balance(address: string, contractAddress: string, rpcUrl: string): Promise<bigint> {
  try {
    const functionSelector = '0x70a08231' // balanceOf(address)
    const paddedAddress = address.slice(2).padStart(64, '0')
    const data = functionSelector + paddedAddress

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.warn('Failed to fetch ERC20 balance:', error)
    return BigInt(0)
  }
}