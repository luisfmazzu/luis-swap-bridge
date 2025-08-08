/**
 * Environment Configuration
 * 
 * This module handles environment variables safely:
 * - Public variables (NEXT_PUBLIC_*) are exposed to the browser
 * - Private variables are only available on the server
 */

// Public environment variables (safe for browser)
export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
} as const

// Private environment variables (server-side only)
function getServerEnv() {
  // Only access these on the server side
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed on the client side')
  }

  return {
    // WalletConnect/Reown Configuration
    REOWN_PROJECT_ID: process.env.REOWN_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || '',
    
    // DEX Aggregator API Keys
    ONEINCH_API_KEY: process.env.ONEINCH_API_KEY || '',
    
    // Blockchain RPC URLs
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || '',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || '',
    BSC_RPC_URL: process.env.BSC_RPC_URL || '',
    ARBITRUM_RPC_URL: process.env.ARBITRUM_RPC_URL || '',
    OPTIMISM_RPC_URL: process.env.OPTIMISM_RPC_URL || '',
    AVALANCHE_RPC_URL: process.env.AVALANCHE_RPC_URL || '',
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || '',
    CELO_RPC_URL: process.env.CELO_RPC_URL || '',
    TRON_RPC_URL: process.env.TRON_RPC_URL || '',
  } as const
}

// Export server environment variables (only accessible on server)
export const serverEnv = typeof window === 'undefined' ? getServerEnv() : null

// Helper function to get server environment safely
export function getServerEnvVar(key: keyof ReturnType<typeof getServerEnv>): string {
  if (typeof window !== 'undefined') {
    throw new Error(`Server environment variable ${key} cannot be accessed on the client side`)
  }
  
  const env = getServerEnv()
  return env[key]
}

// Type-safe environment configuration
export type PublicEnv = typeof publicEnv
export type ServerEnv = NonNullable<typeof serverEnv>

// Validation helper
export function validateRequiredEnvVars() {
  const errors: string[] = []
  
  if (typeof window === 'undefined') {
    // Server-side validation
    const env = getServerEnv()
    
    
    if (!env.REOWN_PROJECT_ID) {
      errors.push('REOWN_PROJECT_ID is required')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Missing required environment variables:\n${errors.join('\n')}`)
  }
}