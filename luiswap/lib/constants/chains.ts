import { mainnet, polygon, bsc, arbitrum, optimism, avalanche } from 'wagmi/chains'

export interface ChainInfo {
  id: number
  name: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  iconUrl?: string
  color?: string
}

// Enhanced chain information
export const CHAIN_INFO: Record<number, ChainInfo> = {
  [mainnet.id]: {
    id: mainnet.id,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: mainnet.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || mainnet.rpcUrls.default.http[0],
      ...mainnet.rpcUrls.default.http,
    ],
    blockExplorerUrls: [mainnet.blockExplorers.default.url],
    iconUrl: '/icons/ethereum.svg',
    color: '#627EEA',
  },
  [polygon.id]: {
    id: polygon.id,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: polygon.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || polygon.rpcUrls.default.http[0],
      ...polygon.rpcUrls.default.http,
    ],
    blockExplorerUrls: [polygon.blockExplorers.default.url],
    iconUrl: '/icons/polygon.svg',
    color: '#8247E5',
  },
  [bsc.id]: {
    id: bsc.id,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: bsc.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_BSC_RPC_URL || bsc.rpcUrls.default.http[0],
      ...bsc.rpcUrls.default.http,
    ],
    blockExplorerUrls: [bsc.blockExplorers.default.url],
    iconUrl: '/icons/bnb.svg',
    color: '#F3BA2F',
  },
  [arbitrum.id]: {
    id: arbitrum.id,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: arbitrum.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || arbitrum.rpcUrls.default.http[0],
      ...arbitrum.rpcUrls.default.http,
    ],
    blockExplorerUrls: [arbitrum.blockExplorers.default.url],
    iconUrl: '/icons/arbitrum.svg',
    color: '#28A0F0',
  },
  [optimism.id]: {
    id: optimism.id,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: optimism.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || optimism.rpcUrls.default.http[0],
      ...optimism.rpcUrls.default.http,
    ],
    blockExplorerUrls: [optimism.blockExplorers.default.url],
    iconUrl: '/icons/optimism.svg',
    color: '#FF0420',
  },
  [avalanche.id]: {
    id: avalanche.id,
    name: 'Avalanche',
    shortName: 'AVAX',
    nativeCurrency: avalanche.nativeCurrency,
    rpcUrls: [
      process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || avalanche.rpcUrls.default.http[0],
      ...avalanche.rpcUrls.default.http,
    ],
    blockExplorerUrls: [avalanche.blockExplorers.default.url],
    iconUrl: '/icons/avalanche.svg',
    color: '#E84142',
  },
}

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = Object.keys(CHAIN_INFO).map(Number)

// Default chain (Ethereum)
export const DEFAULT_CHAIN_ID = mainnet.id

// Helper functions
export const getChainInfo = (chainId: number): ChainInfo | undefined => {
  return CHAIN_INFO[chainId]
}

export const getChainName = (chainId: number): string => {
  return getChainInfo(chainId)?.name || 'Unknown Chain'
}

export const getChainShortName = (chainId: number): string => {
  return getChainInfo(chainId)?.shortName || 'Unknown'
}

export const getChainColor = (chainId: number): string => {
  return getChainInfo(chainId)?.color || '#6B7280'
}

export const getChainIcon = (chainId: number): string => {
  return getChainInfo(chainId)?.iconUrl || '/icons/default-chain.svg'
}

export const isChainSupported = (chainId: number): boolean => {
  return SUPPORTED_CHAIN_IDS.includes(chainId)
}

export const getBlockExplorerUrl = (chainId: number): string => {
  return getChainInfo(chainId)?.blockExplorerUrls[0] || ''
}

export const getBlockExplorerTxUrl = (chainId: number, txHash: string): string => {
  const baseUrl = getBlockExplorerUrl(chainId)
  return baseUrl ? `${baseUrl}/tx/${txHash}` : ''
}

export const getBlockExplorerAddressUrl = (chainId: number, address: string): string => {
  const baseUrl = getBlockExplorerUrl(chainId)
  return baseUrl ? `${baseUrl}/address/${address}` : ''
}

// Chain categories for UI organization
export const CHAIN_CATEGORIES = {
  LAYER_1: [mainnet.id, bsc.id, avalanche.id],
  LAYER_2: [polygon.id, arbitrum.id, optimism.id],
} as const

export const getChainCategory = (chainId: number): 'LAYER_1' | 'LAYER_2' | 'UNKNOWN' => {
  if (CHAIN_CATEGORIES.LAYER_1.includes(chainId)) return 'LAYER_1'
  if (CHAIN_CATEGORIES.LAYER_2.includes(chainId)) return 'LAYER_2'
  return 'UNKNOWN'
}

// Network status for UI
export const NETWORK_STATUS = {
  ONLINE: 'online',
  DEGRADED: 'degraded',
  OFFLINE: 'offline',
} as const

export type NetworkStatus = typeof NETWORK_STATUS[keyof typeof NETWORK_STATUS]

// Gas price tiers for different chains
export const GAS_PRICE_TIERS = {
  [mainnet.id]: {
    slow: '20',
    standard: '25',
    fast: '30',
  },
  [polygon.id]: {
    slow: '30',
    standard: '40',
    fast: '50',
  },
  [bsc.id]: {
    slow: '5',
    standard: '10',
    fast: '15',
  },
  [arbitrum.id]: {
    slow: '0.1',
    standard: '0.25',
    fast: '0.5',
  },
  [optimism.id]: {
    slow: '0.001',
    standard: '0.002',
    fast: '0.005',
  },
  [avalanche.id]: {
    slow: '25',
    standard: '30',
    fast: '35',
  },
} as const

export const getGasPriceTiers = (chainId: number) => {
  return GAS_PRICE_TIERS[chainId as keyof typeof GAS_PRICE_TIERS] || {
    slow: '20',
    standard: '25',
    fast: '30',
  }
}