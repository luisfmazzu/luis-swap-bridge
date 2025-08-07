// Token list management and expansion service
// This provides fallback token lists and can be extended with external sources

export interface TokenListToken {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
  coingeckoId?: string
  verified?: boolean
}

export interface TokenList {
  name: string
  version: string
  tokens: TokenListToken[]
  timestamp: string
}

// Comprehensive testnet token lists for better discovery
export const TESTNET_TOKEN_LISTS: Record<string, TokenListToken[]> = {
  // Ethereum Sepolia Testnet
  ethereum: [
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 11155111,
      coingeckoId: 'usd-coin',
      verified: true,
    },
    {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 11155111,
      coingeckoId: 'weth',
      verified: true,
    },
    {
      address: '0x2227C4aE0fA56F51d4e6A46b13C2f8b9a2A5B3E3',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 11155111,
      coingeckoId: 'dai',
      verified: true,
    },
    {
      address: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
      symbol: 'LINK',
      name: 'ChainLink Token',
      decimals: 18,
      chainId: 11155111,
      coingeckoId: 'chainlink',
      verified: true,
    },
    // Add more Sepolia testnet tokens as they become available
  ],

  // Celo Alfajores Testnet
  celo: [
    {
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      symbol: 'cUSD',
      name: 'Celo Dollar',
      decimals: 18,
      chainId: 44787,
      coingeckoId: 'celo-dollar',
      verified: true,
    },
    {
      address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
      symbol: 'cEUR',
      name: 'Celo Euro',
      decimals: 18,
      chainId: 44787,
      coingeckoId: 'celo-euro',
      verified: true,
    },
    {
      address: '0xBba91F588d031469ABCCA566FE80fB1Ad8Ee3287',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 44787,
      coingeckoId: 'tether',
      verified: true,
    },
    {
      address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
      symbol: 'cREAL',
      name: 'Celo Brazilian Real',
      decimals: 18,
      chainId: 44787,
      coingeckoId: 'celo-brazilian-real',
      verified: true,
    },
  ],

  // TRON Nile Testnet
  tron: [
    {
      address: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 3448148188, // Nile testnet chain ID
      coingeckoId: 'tether',
      verified: true,
    },
    {
      address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 3448148188,
      coingeckoId: 'usd-coin',
      verified: true,
    },
    {
      address: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
      symbol: 'USDT',
      name: 'Tether USD (Alternative)',
      decimals: 6,
      chainId: 3448148188,
      coingeckoId: 'tether',
      verified: false, // Alternative contract, less verified
    },
  ],
}

// Get token list for a specific network
export function getTokenListForNetwork(network: 'ethereum' | 'celo' | 'tron'): TokenListToken[] {
  return TESTNET_TOKEN_LISTS[network] || []
}

// Find token info by address
export function findTokenByAddress(network: 'ethereum' | 'celo' | 'tron', address: string): TokenListToken | undefined {
  const tokenList = getTokenListForNetwork(network)
  return tokenList.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  )
}

// Get all verified tokens for a network
export function getVerifiedTokens(network: 'ethereum' | 'celo' | 'tron'): TokenListToken[] {
  return getTokenListForNetwork(network).filter(token => token.verified !== false)
}

// Get token addresses for balance checking
export function getTokenAddressesForNetwork(network: 'ethereum' | 'celo' | 'tron'): string[] {
  return getTokenListForNetwork(network).map(token => token.address)
}

// Token list statistics
export function getTokenListStats() {
  const stats = {
    ethereum: TESTNET_TOKEN_LISTS.ethereum.length,
    celo: TESTNET_TOKEN_LISTS.celo.length,
    tron: TESTNET_TOKEN_LISTS.tron.length,
    total: 0,
    verified: 0,
  }

  stats.total = stats.ethereum + stats.celo + stats.tron
  stats.verified = Object.values(TESTNET_TOKEN_LISTS)
    .flat()
    .filter(token => token.verified !== false)
    .length

  return stats
}

// Extended CoinGecko ID mappings for better price fetching
export const EXTENDED_COINGECKO_MAPPINGS: Record<string, string> = {
  // Stablecoins
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'DAI': 'dai',
  'FRAX': 'frax',
  'LUSD': 'liquity-usd',
  'TUSD': 'true-usd',
  'GUSD': 'gemini-dollar',

  // Major tokens
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
  '1INCH': '1inch',

  // Celo ecosystem
  'CELO': 'celo',
  'cUSD': 'celo-dollar',
  'cEUR': 'celo-euro',
  'cREAL': 'celo-brazilian-real',

  // TRON ecosystem
  'TRX': 'tron',
  'BTT': 'bittorrent',
  'JST': 'just',
  'SUN': 'sun-token',
  'WIN': 'wink',

  // Layer 2 tokens
  'MATIC': 'matic-network',
  'OP': 'optimism',
  'ARB': 'arbitrum',

  // DeFi tokens
  'CAKE': 'pancakeswap-token',
  'BNB': 'binancecoin',
  'AVAX': 'avalanche-2',
}

// Get CoinGecko ID for a token symbol
export function getCoinGeckoId(symbol: string): string | undefined {
  return EXTENDED_COINGECKO_MAPPINGS[symbol.toUpperCase()]
}

// Validate token address format
export function isValidTokenAddress(address: string, network: 'ethereum' | 'celo' | 'tron'): boolean {
  if (network === 'tron') {
    // TRON addresses start with 'T' and are base58 encoded
    return /^T[A-HJ-NP-Za-km-z1-9]{33}$/.test(address)
  } else {
    // Ethereum/Celo addresses are hex and 42 characters long
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
}

// Future: This could be extended to fetch token lists from external sources
export async function fetchExternalTokenList(url: string): Promise<TokenList | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=3600', // Cache for 1 hour
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status}`)
    }

    const tokenList: TokenList = await response.json()
    
    // Validate the token list format
    if (!tokenList.tokens || !Array.isArray(tokenList.tokens)) {
      throw new Error('Invalid token list format')
    }

    console.log(`✅ Fetched external token list with ${tokenList.tokens.length} tokens`)
    return tokenList
  } catch (error) {
    console.warn('Failed to fetch external token list:', error)
    return null
  }
}

// Popular testnet token list URLs (for future implementation)
export const EXTERNAL_TOKEN_LIST_URLS = {
  // These are examples - in production you'd use real testnet token lists
  ethereum: [
    // 'https://tokens.uniswap.org/sepolia.json', // If this existed
    // 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  ],
  celo: [
    // 'https://raw.githubusercontent.com/celo-org/celo-token-list/main/celo.tokenlist.json',
  ],
  tron: [
    // TRON doesn't have standardized token lists like Ethereum
  ],
}