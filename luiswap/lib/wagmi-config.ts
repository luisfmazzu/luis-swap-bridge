import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism, avalanche, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// WalletConnect/Reown Project ID - Get this from https://cloud.walletconnect.com/
const projectId = process.env.REOWN_PROJECT_ID || 
                 process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 
                 process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                 'demo-project-id'

// Configure supported chains
export const supportedChains = [
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
  sepolia,
] as const

// Chain configurations with RPC endpoints
const chainConfig = {
  [mainnet.id]: {
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC_URL || process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || mainnet.rpcUrls.default.http[0],
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [polygon.id]: {
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || process.env.NEXT_PUBLIC_POLYGON_RPC_URL || polygon.rpcUrls.default.http[0],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  [bsc.id]: {
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || bsc.rpcUrls.default.http[0],
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  [arbitrum.id]: {
    name: 'Arbitrum One',
    rpcUrl: process.env.ARBITRUM_RPC_URL || process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || arbitrum.rpcUrls.default.http[0],
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [optimism.id]: {
    name: 'Optimism',
    rpcUrl: process.env.OPTIMISM_RPC_URL || process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || optimism.rpcUrls.default.http[0],
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [avalanche.id]: {
    name: 'Avalanche',
    rpcUrl: process.env.AVALANCHE_RPC_URL || process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || avalanche.rpcUrls.default.http[0],
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  },
  [sepolia.id]: {
    name: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0],
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
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
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        icons: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/icon.png`],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000',
        },
      },
    }),
    coinbaseWallet({
      appName: 'LuiSwap',
      appLogoUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/icon.png`,
      // Disable analytics to prevent 401 errors
      enableMobileWalletLink: true,
      reloadOnDisconnect: false,
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