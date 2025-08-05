'use client'

// Dynamic wagmi configuration that loads only on client side
let wagmiConfig: any = null
let supportedChains: any = null
let chainConfig: any = null

// Dynamic loader for wagmi configuration
export async function loadWagmiConfig() {
  if (typeof window === 'undefined') {
    // Return null for server-side
    return null
  }

  if (wagmiConfig) {
    // Return cached config if already loaded
    return { wagmiConfig, supportedChains, chainConfig }
  }

  try {
    // Dynamic import of wagmi config
    const configModule = await import('@/lib/wagmi-config')
    
    wagmiConfig = configModule.wagmiConfig
    supportedChains = configModule.supportedChains
    chainConfig = configModule.chainConfig

    return { wagmiConfig, supportedChains, chainConfig }
  } catch (error) {
    console.error('Failed to load wagmi config:', error)
    return null
  }
}

// Helper to get wagmi config synchronously (returns null if not loaded)
export function getWagmiConfig() {
  return wagmiConfig
}

// Helper to check if wagmi is loaded
export function isWagmiLoaded() {
  return wagmiConfig !== null
}

// Dynamic chain utilities
export async function getDynamicChainInfo(chainId: number) {
  const config = await loadWagmiConfig()
  if (!config) return null
  
  return config.chainConfig[chainId]
}

export async function isDynamicChainSupported(chainId: number) {
  const config = await loadWagmiConfig()
  if (!config) return false
  
  return config.supportedChains.some((chain: any) => chain.id === chainId)
}