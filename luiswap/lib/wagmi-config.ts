import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum, optimism, avalanche, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask /*, walletConnect */ } from 'wagmi/connectors'
// import { turnkeySimple } from '@/lib/connectors/turnkey-simple'

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
export const chainConfig = {
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
} as const

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'LuiSwap',
        url: process.env.NEXT_PUBLIC_APP_URL!,
        iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
      },
    }),
    // walletConnect({
    //   projectId,
    //   metadata: {
    //     name: 'LuiSwap',
    //     description: 'Multichain Stablecoin DEX & Bridge Platform',
    //     url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    //     icons: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/icon.png`],
    //   },
    //   showQrModal: true,
    //   qrModalOptions: {
    //     themeMode: 'dark',
    //     themeVariables: {
    //       '--wcm-z-index': '1000',
    //     },
    //   },
    // }),
    coinbaseWallet({
      appName: 'LuiSwap',
      appLogoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
      // Disable analytics and telemetry to prevent 401 errors
      enableMobileWalletLink: true,
      reloadOnDisconnect: false,
      // Disable analytics completely
      preference: 'smartWalletOnly',
    }),
    // turnkeySimple({
    //   organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || '',
    //   apiBaseUrl: process.env.TURNKEY_API_BASE_URL || 'https://api.turnkey.com',
    //   serverSignUrl: process.env.TURNKEY_SERVER_SIGN_URL || '/api/turnkey/sign',
    //   appName: 'LuiSwap',
    //   appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    //   appIconUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/icon.png`,
    // }),
  ],
  transports: Object.fromEntries(
    supportedChains.map((chain) => [
      chain.id,
      http(chainConfig[chain.id]?.rpcUrl),
    ])
  ),
  ssr: true,
})

// Helper functions
export const getChainConfig = (chainId: number) => {
  return chainConfig[chainId as keyof typeof chainConfig]
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