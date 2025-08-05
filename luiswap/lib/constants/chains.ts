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

// Enhanced chain information - All supported chains for swap display
export const CHAIN_INFO: Record<number, ChainInfo> = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/', 'https://eth-mainnet.alchemyapi.io/v2/'],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/icons/ethereum.svg',
    color: '#627EEA',
  },
  // Polygon
  137: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/', 'https://rpc-mainnet.matic.network'],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: '/icons/polygon.svg',
    color: '#8247E5',
  },
  // BSC
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BNB',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
    iconUrl: '/icons/bnb.svg',
    color: '#F3BA2F',
  },
  // Arbitrum
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrl: '/icons/arbitrum.svg',
    color: '#28A0F0',
  },
  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io/'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrl: '/icons/optimism.svg',
    color: '#FF0420',
  },
  // Avalanche
  43114: {
    id: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
    iconUrl: '/icons/avalanche.svg',
    color: '#E84142',
  },
  // Sepolia Testnet
  11155111: {
    id: 11155111,
    name: 'Sepolia',
    shortName: 'SEP',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    iconUrl: '/icons/ethereum.svg',
    color: '#627EEA',
  },
  // Tron Testnet (for bridge only)
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
  // Celo Testnet (for bridge only)
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

// Chain categories for UI organization
export const CHAIN_CATEGORIES = {
  LAYER_1: [1, 56, 43114], // Ethereum, BSC, Avalanche
  LAYER_2: [137, 42161, 10], // Polygon, Arbitrum, Optimism
  TESTNET: [11155111, tronTestnet.id, celoTestnet.id], // Sepolia, Tron, Celo testnets
} as const

export const getChainCategory = (chainId: number): 'LAYER_1' | 'LAYER_2' | 'TESTNET' | 'UNKNOWN' => {
  if (CHAIN_CATEGORIES.LAYER_1.includes(chainId)) return 'LAYER_1'
  if (CHAIN_CATEGORIES.LAYER_2.includes(chainId)) return 'LAYER_2'
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

// Gas price tiers for different chains
export const GAS_PRICE_TIERS = {
  // Mainnet chains
  1: {
    slow: '20',
    standard: '25',
    fast: '30',
  },
  137: {
    slow: '30',
    standard: '40',
    fast: '50',
  },
  56: {
    slow: '5',
    standard: '10',
    fast: '15',
  },
  42161: {
    slow: '0.1',
    standard: '0.25',
    fast: '0.5',
  },
  10: {
    slow: '0.001',
    standard: '0.002',
    fast: '0.005',
  },
  43114: {
    slow: '25',
    standard: '30',
    fast: '35',
  },
  // Testnet chains
  11155111: {
    slow: '10',
    standard: '15',
    fast: '20',
  },
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