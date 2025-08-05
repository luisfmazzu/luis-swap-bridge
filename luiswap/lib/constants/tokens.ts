import { type Address } from 'viem'
import { CHAIN_INFO } from './chains'

export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chainId: number
}

// Native tokens for each chain
export const NATIVE_TOKENS: Record<number, Token> = {
  1: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    chainId: 1,
  },
  137: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    chainId: 137,
  },
  56: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    chainId: 56,
  },
  42161: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    chainId: 42161,
  },
  10: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    chainId: 10,
  },
  43114: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'AVAX',
    name: 'Avalanche',
    decimals: 18,
    chainId: 43114,
  },
  11155111: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Sepolia Ether',
    decimals: 18,
    chainId: 11155111,
  },
}

// Stablecoin tokens by chain
export const STABLECOIN_TOKENS: Record<number, Token[]> = {
  // Ethereum Mainnet
  1: [
    {
      address: '0xA0b86a33E6441E7e3c4fb0c2f1F8d7A9a8F6A8A6',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 1,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png',
    },
    {
      address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
      symbol: 'FRAX',
      name: 'Frax',
      decimals: 18,
      chainId: 1,
      logoURI: 'https://assets.coingecko.com/coins/images/13422/thumb/frax_logo.png',
    },
    {
      address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
      symbol: 'LUSD',
      name: 'Liquity USD',
      decimals: 18,
      chainId: 1,
      logoURI: 'https://assets.coingecko.com/coins/images/14666/thumb/Group_3.png',
    },
  ],
  
  // Polygon
  137: [
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 137,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 137,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 137,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png',
    },
  ],
  
  // BSC
  56: [
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://assets.coingecko.com/coins/images/9576/thumb/BUSD.png',
    },
  ],
  
  // Arbitrum
  42161: [
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 42161,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 42161,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 42161,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png',
    },
  ],
  
  // Optimism
  10: [
    {
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 10,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 10,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 10,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png',
    },
  ],
  
  // Avalanche
  43114: [
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 43114,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 43114,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 43114,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png',
    },
  ],
  
  // Sepolia Testnet (for testing)
  11155111: [
    {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 11155111,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
    },
  ],
}

// Helper functions
export const getTokensByChain = (chainId: number): Token[] => {
  const stablecoins = STABLECOIN_TOKENS[chainId] || []
  const nativeToken = NATIVE_TOKENS[chainId]
  
  // Return native token first, then stablecoins
  return nativeToken ? [nativeToken, ...stablecoins] : stablecoins
}

export const getTokenByAddress = (chainId: number, address: Address): Token | undefined => {
  const tokens = getTokensByChain(chainId)
  return tokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  )
}

export const getTokenBySymbol = (chainId: number, symbol: string): Token | undefined => {
  const tokens = getTokensByChain(chainId)
  return tokens.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  )
}

export const getAllTokens = (): Token[] => {
  const allStablecoins = Object.values(STABLECOIN_TOKENS).flat()
  const allNativeTokens = Object.values(NATIVE_TOKENS)
  return [...allNativeTokens, ...allStablecoins]
}

export const getSupportedTokenSymbols = (chainId: number): string[] => {
  return getTokensByChain(chainId).map(token => token.symbol)
}

// Common stablecoin addresses for easy reference
export const COMMON_TOKENS = {
  USDC: 'USDC',
  USDT: 'USDT',
  DAI: 'DAI',
  FRAX: 'FRAX',
  LUSD: 'LUSD',
  BUSD: 'BUSD',
} as const

export type CommonTokenSymbol = keyof typeof COMMON_TOKENS

// Supported chains array (from chains constants)
export const SUPPORTED_CHAINS = Object.values(CHAIN_INFO)