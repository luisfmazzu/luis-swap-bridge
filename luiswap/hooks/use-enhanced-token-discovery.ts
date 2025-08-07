'use client'

import { useState, useEffect } from 'react'
import { discoverWalletTokens, type DiscoveredToken } from '@/actions/token-discovery'
import { getTokenPricesByIds } from '@/actions/prices'
import { getCoingeckoIdsFromTokens } from '@/lib/token-utils'

export interface EnhancedTokenWithPrice extends DiscoveredToken {
  priceUSD: number
  valueUSD: number
}

export interface TokenDiscoveryStats {
  totalTokens: number
  nativeTokens: number
  erc20Tokens: number
  discoveryMethods: Record<string, number>
  verifiedTokens: number
  totalValueUSD: number
}

export function useEnhancedTokenDiscovery(address?: string, network?: 'tron' | 'ethereum' | 'celo') {
  const [tokens, setTokens] = useState<EnhancedTokenWithPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TokenDiscoveryStats>({
    totalTokens: 0,
    nativeTokens: 0,
    erc20Tokens: 0,
    discoveryMethods: {},
    verifiedTokens: 0,
    totalValueUSD: 0,
  })

  useEffect(() => {
    const discoverAndPriceTokens = async () => {
      if (!address || !network) {
        setTokens([])
        setStats({
          totalTokens: 0,
          nativeTokens: 0,
          erc20Tokens: 0,
          discoveryMethods: {},
          verifiedTokens: 0,
          totalValueUSD: 0,
        })
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log('🚀 Enhanced Token Discovery: Starting for', network, 'address:', address)

        // Step 1: Discover tokens using enhanced system
        const discoveredTokens = await discoverWalletTokens(address, network)
        
        if (discoveredTokens.length === 0) {
          console.log('🔍 Enhanced Token Discovery: No tokens found')
          setTokens([])
          setLoading(false)
          return
        }

        console.log('✅ Enhanced Token Discovery: Found tokens:', 
          discoveredTokens.map(t => `${t.symbol} (${t.discoveryMethod})`)
        )

        // Step 2: Get CoinGecko IDs for price fetching
        const coingeckoIds = discoveredTokens
          .map(token => token.coingeckoId)
          .filter(Boolean) as string[]
        
        console.log('🔍 Enhanced Token Discovery: Fetching prices for:', coingeckoIds)

        // Step 3: Fetch prices
        const prices = await getTokenPricesByIds(coingeckoIds)
        console.log('✅ Enhanced Token Discovery: Fetched prices:', prices)

        // Step 4: Combine tokens with prices and calculate stats
        const tokensWithPrices: EnhancedTokenWithPrice[] = discoveredTokens.map(token => {
          const priceUSD = token.coingeckoId ? (prices[token.coingeckoId] || 0) : 0
          const valueUSD = parseFloat(token.balance) * priceUSD

          return {
            ...token,
            priceUSD,
            valueUSD
          }
        })

        // Calculate discovery stats
        const discoveryStats: TokenDiscoveryStats = {
          totalTokens: tokensWithPrices.length,
          nativeTokens: tokensWithPrices.filter(t => t.isNative).length,
          erc20Tokens: tokensWithPrices.filter(t => !t.isNative).length,
          discoveryMethods: {},
          verifiedTokens: tokensWithPrices.filter(t => t.verified).length,
          totalValueUSD: tokensWithPrices.reduce((sum, t) => sum + t.valueUSD, 0),
        }

        // Count discovery methods
        tokensWithPrices.forEach(token => {
          discoveryStats.discoveryMethods[token.discoveryMethod] = 
            (discoveryStats.discoveryMethods[token.discoveryMethod] || 0) + 1
        })

        setTokens(tokensWithPrices)
        setStats(discoveryStats)

        console.log('✅ Enhanced Token Discovery Complete:', {
          tokens: tokensWithPrices.length,
          totalValue: `$${discoveryStats.totalValueUSD.toFixed(2)}`,
          methods: Object.keys(discoveryStats.discoveryMethods),
        })

      } catch (err) {
        console.error('❌ Enhanced Token Discovery Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to discover wallet tokens')
        setTokens([])
      } finally {
        setLoading(false)
      }
    }

    discoverAndPriceTokens()

    // Refresh every 5 minutes
    const interval = setInterval(discoverAndPriceTokens, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [address, network])

  // Helper functions
  const getTokensByDiscoveryMethod = (method: DiscoveredToken['discoveryMethod']) => {
    return tokens.filter(token => token.discoveryMethod === method)
  }

  const getTokenBySymbol = (symbol: string) => {
    return tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase())
  }

  const getNativeToken = () => {
    return tokens.find(token => token.isNative)
  }

  const getERC20Tokens = () => {
    return tokens.filter(token => !token.isNative)
  }

  const getVerifiedTokens = () => {
    return tokens.filter(token => token.verified)
  }

  const getUnverifiedTokens = () => {
    return tokens.filter(token => !token.verified)
  }

  const getTotalValueUSD = () => {
    return tokens.reduce((total, token) => total + token.valueUSD, 0)
  }

  // Get tokens sorted by value (highest first)
  const getTokensByValue = () => {
    return [...tokens].sort((a, b) => b.valueUSD - a.valueUSD)
  }

  // Get discovery method breakdown
  const getDiscoveryMethodBreakdown = () => {
    const methods: Record<string, { count: number; tokens: EnhancedTokenWithPrice[] }> = {}
    
    tokens.forEach(token => {
      const method = token.discoveryMethod
      if (!methods[method]) {
        methods[method] = { count: 0, tokens: [] }
      }
      methods[method].count++
      methods[method].tokens.push(token)
    })

    return methods
  }

  return {
    // Core data
    tokens,
    loading,
    error,
    stats,

    // Helper functions
    getTokensByDiscoveryMethod,
    getTokenBySymbol,
    getNativeToken,
    getERC20Tokens,
    getVerifiedTokens,
    getUnverifiedTokens,
    getTotalValueUSD,
    getTokensByValue,
    getDiscoveryMethodBreakdown,

    // Convenience flags
    hasTokens: tokens.length > 0,
    hasNativeToken: tokens.some(t => t.isNative),
    hasERC20Tokens: tokens.some(t => !t.isNative),
    hasVerifiedTokens: tokens.some(t => t.verified),
    hasUnverifiedTokens: tokens.some(t => !t.verified),
  }
}