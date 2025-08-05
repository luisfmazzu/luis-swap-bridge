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

// Native tokens for testnet chains only
export const NATIVE_TOKENS: Record<number, Token> = {
  // Tron Testnet
  3448148188: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'TRX',
    name: 'Tron Testnet',
    decimals: 6,
    chainId: 3448148188,
  },
  // Celo Testnet (Alfajores)
  44787: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'CELO',
    name: 'Celo Testnet',
    decimals: 18,
    chainId: 44787,
  },
}

// Stablecoin tokens by chain - Testnets only
export const STABLECOIN_TOKENS: Record<number, Token[]> = {
  // Tron Testnet (Nile)
  3448148188: [
    {
      address: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
      symbol: 'USDT',
      name: 'Tether USD (Testnet)',
      decimals: 6,
      chainId: 3448148188,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      symbol: 'USDC',
      name: 'USD Coin (Testnet)',
      decimals: 6,
      chainId: 3448148188,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
  ],
  
  // Celo Testnet (Alfajores)
  44787: [
    {
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      symbol: 'USDC',
      name: 'USD Coin (Testnet)',
      decimals: 6,
      chainId: 44787,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
      symbol: 'USDT',
      name: 'Tether USD (Testnet)',
      decimals: 6,
      chainId: 44787,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
  ],
}

// Bridge-specific tokens (only USDT and USDC for bridge operations) - Testnets only
export const BRIDGE_TOKENS: Record<number, Token[]> = {
  // Tron Testnet (Nile)
  3448148188: [
    {
      address: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs',
      symbol: 'USDT',
      name: 'Tether USD (Testnet)',
      decimals: 6,
      chainId: 3448148188,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
    },
    {
      address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      symbol: 'USDC',
      name: 'USD Coin (Testnet)',
      decimals: 6,
      chainId: 3448148188,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
  ],
  
  // Celo Testnet (Alfajores)
  44787: [
    {
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      symbol: 'USDC',
      name: 'USD Coin (Testnet)',
      decimals: 6,
      chainId: 44787,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    },
    {
      address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
      symbol: 'USDT',
      name: 'Tether USD (Testnet)',
      decimals: 6,
      chainId: 44787,
      logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
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

// Helper function for bridge-specific tokens (only USDT and USDC)
export const getBridgeTokensByChain = (chainId: number): Token[] => {
  return BRIDGE_TOKENS[chainId] || []
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