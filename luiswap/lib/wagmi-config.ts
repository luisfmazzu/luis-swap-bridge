import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism, avalanche } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// WalletConnect Project ID - You'll need to get this from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'

// Configure supported chains
export const supportedChains = [
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
] as const

// Chain configurations with RPC endpoints
const chainConfig = {
  [mainnet.id]: {
    name: 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || mainnet.rpcUrls.default.http[0],
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [polygon.id]: {
    name: 'Polygon',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || polygon.rpcUrls.default.http[0],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  [bsc.id]: {
    name: 'BNB Smart Chain',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || bsc.rpcUrls.default.http[0],
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || arbitrum.rpcUrls.default.http[0],
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [optimism.id]: {
    name: 'Optimism',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || optimism.rpcUrls.default.http[0],
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [avalanche.id]: {
    name: 'Avalanche',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || avalanche.rpcUrls.default.http[0],
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
}

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'LuiSwap',
        url: 'https://luiswap.com',
        iconUrl: 'https://luiswap.com/icon.png',
      },
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'LuiSwap',
        description: 'Multichain Stablecoin DEX & Bridge Platform',
        url: 'https://luiswap.com',
        icons: ['https://luiswap.com/icon.png'],
      },
    }),
    coinbaseWallet({
      appName: 'LuiSwap',
      appLogoUrl: 'https://luiswap.com/icon.png',
    }),
  ],
  transports: Object.fromEntries(
    supportedChains.map((chain) => [
      chain.id,
      http(chainConfig[chain.id]?.rpcUrl),
    ])
  ),
  ssr: true,
})

export { chainConfig }

// Helper functions
export const getChainConfig = (chainId: number) => {
  return chainConfig[chainId]
}

export const getSupportedChainIds = () => {
  return supportedChains.map((chain) => chain.id)
}

export const isChainSupported = (chainId: number) => {
  return getSupportedChainIds().includes(chainId)
}

// Declare module for TypeScript
declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}