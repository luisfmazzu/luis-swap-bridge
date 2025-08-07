import type { DetectedToken } from '@/actions/token-detection'

// Get unique CoinGecko IDs from detected tokens for price fetching
export function getCoingeckoIdsFromTokens(tokens: DetectedToken[]): string[] {
  return [...new Set(
    tokens
      .map(token => token.coingeckoId)
      .filter((id): id is string => Boolean(id))
  )]
}

// Format token balance for display
export function formatTokenBalance(balance: string, decimals: number, maxDecimals: number = 6): string {
  const numBalance = parseFloat(balance)
  const displayDecimals = Math.min(decimals, maxDecimals)
  return numBalance.toFixed(displayDecimals)
}

// Format token balance for mobile display (shorter)
export function formatTokenBalanceMobile(balance: string, decimals: number): string {
  const numBalance = parseFloat(balance)
  
  if (numBalance === 0) return '0'
  if (numBalance < 0.01) return '<0.01'
  if (numBalance < 1) return numBalance.toFixed(3)
  if (numBalance < 1000) return numBalance.toFixed(2)
  if (numBalance < 1000000) return (numBalance / 1000).toFixed(1) + 'K'
  return (numBalance / 1000000).toFixed(1) + 'M'
}

// Get token icon color based on symbol and network
export function getTokenIconGradient(symbol: string, networkId: string, isNative: boolean): string {
  if (isNative) {
    switch (networkId) {
      case 'tron': return 'from-red-500 to-orange-500'
      case 'celo': return 'from-green-500 to-yellow-500'
      case 'ethereum': return 'from-purple-500 to-blue-500'
      default: return 'from-gray-500 to-gray-600'
    }
  } else {
    // Token-specific colors
    switch (symbol.toUpperCase()) {
      case 'USDT': return 'from-green-400 to-green-600'
      case 'CUSD': return 'from-yellow-400 to-yellow-600'
      case 'CEUR': return 'from-blue-400 to-blue-600'
      case 'USDC': return 'from-blue-500 to-indigo-600'
      case 'DAI': return 'from-orange-400 to-yellow-500'
      default: return 'from-indigo-500 to-purple-600'
    }
  }
}