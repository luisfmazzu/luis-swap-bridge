// TRON Testnet configuration (Nile testnet)
export const tronTestnet = {
  id: 3448148188,
  name: 'Tron Testnet',
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://nile.trongrid.io'] }
  },
  blockExplorers: {
    default: { name: 'Nile Tronscan', url: 'https://nile.tronscan.org' }
  }
} as const

// CELO Testnet configuration (Alfajores testnet)
export const celoTestnet = {
  id: 44787,
  name: 'Celo Testnet',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://alfajores-forno.celo-testnet.org'] }
  },
  blockExplorers: {
    default: { name: 'Alfajores Blockscout', url: 'https://explorer.celo.org/alfajores' }
  }
} as const

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

// Enhanced chain information - Testnets only
export const CHAIN_INFO: Record<number, ChainInfo> = {
  [tronTestnet.id]: {
    id: tronTestnet.id,
    name: 'Tron Testnet',
    shortName: 'TRX',
    nativeCurrency: tronTestnet.nativeCurrency,
    rpcUrls: [
      process.env.TRON_TESTNET_RPC_URL || process.env.NEXT_PUBLIC_TRON_TESTNET_RPC_URL || tronTestnet.rpcUrls.default.http[0],
      ...tronTestnet.rpcUrls.default.http,
    ],
    blockExplorerUrls: [tronTestnet.blockExplorers.default.url],
    iconUrl: '/icons/tron.svg',
    color: '#FF060A',
  },
  [celoTestnet.id]: {
    id: celoTestnet.id,
    name: 'Celo Testnet',
    shortName: 'CELO',
    nativeCurrency: celoTestnet.nativeCurrency,
    rpcUrls: [
      process.env.CELO_TESTNET_RPC_URL || process.env.NEXT_PUBLIC_CELO_TESTNET_RPC_URL || celoTestnet.rpcUrls.default.http[0],
      ...celoTestnet.rpcUrls.default.http,
    ],
    blockExplorerUrls: [celoTestnet.blockExplorers.default.url],
    iconUrl: '/icons/celo.svg',
    color: '#35D07F',
  },
}

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = Object.keys(CHAIN_INFO).map(Number)

// Default chain (Tron Testnet)
export const DEFAULT_CHAIN_ID = tronTestnet.id

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

// Chain categories for UI organization - Testnets only
export const CHAIN_CATEGORIES = {
  TESTNET: [tronTestnet.id, celoTestnet.id],
} as const

export const getChainCategory = (chainId: number): 'TESTNET' | 'UNKNOWN' => {
  if (CHAIN_CATEGORIES.TESTNET.includes(chainId)) return 'TESTNET'
  return 'UNKNOWN'
}

// Network status for UI
export const NETWORK_STATUS = {
  ONLINE: 'online',
  DEGRADED: 'degraded',
  OFFLINE: 'offline',
} as const

export type NetworkStatus = typeof NETWORK_STATUS[keyof typeof NETWORK_STATUS]

// Gas price tiers for testnet chains
export const GAS_PRICE_TIERS = {
  [tronTestnet.id]: {
    slow: '1',
    standard: '2',
    fast: '3',
  },
  [celoTestnet.id]: {
    slow: '0.5',
    standard: '1.0',
    fast: '2.0',
  },
} as const

export const getGasPriceTiers = (chainId: number) => {
  return GAS_PRICE_TIERS[chainId as keyof typeof GAS_PRICE_TIERS] || {
    slow: '1',
    standard: '2',
    fast: '3',
  }
}