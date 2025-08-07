'use client'

import { useEffect, useState } from 'react'
import { detectWalletTokens, type DetectedToken } from '@/actions/token-detection'
import { getTokenPricesByIds } from '@/actions/prices'
import { getCoingeckoIdsFromTokens } from '@/lib/token-utils'

export interface TokenWithPrice extends DetectedToken {
  priceUSD: number
  valueUSD: number
}

export function useWalletTokens(address?: string, network?: 'tron' | 'ethereum' | 'celo') {
  const [tokens, setTokens] = useState<TokenWithPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const detectAndPriceTokens = async () => {
      if (!address || !network) {
        setTokens([])
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log('🔍 useWalletTokens: Detecting tokens for', network, 'address:', address)

        // Step 1: Try enhanced token detection first, then fall back to original
        console.log('🔍 useWalletTokens: Trying enhanced discovery first...')
        
        let detectedTokens
        try {
          // Import and use enhanced discovery
          const { discoverWalletTokens } = await import('../actions/token-discovery')
          const enhancedTokens = await discoverWalletTokens(address, network)
          
          if (enhancedTokens.length > 0) {
            console.log('✅ useWalletTokens: Using enhanced discovery results')
            // Convert to DetectedToken format for compatibility
            detectedTokens = enhancedTokens.map(token => ({
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              balance: token.balance,
              rawBalance: token.rawBalance,
              logoUrl: token.logoUrl,
              isNative: token.isNative,
              network: token.network,
              coingeckoId: token.coingeckoId
            }))
          } else {
            // Fallback to original detection
            console.log('⚠️ useWalletTokens: Enhanced discovery found nothing, using original')
            detectedTokens = await detectWalletTokens(address, network)
          }
        } catch (enhancedError) {
          console.warn('⚠️ useWalletTokens: Enhanced discovery failed, using original:', enhancedError)
          detectedTokens = await detectWalletTokens(address, network)
        }
        
        if (detectedTokens.length === 0) {
          console.log('🔍 useWalletTokens: No tokens found')
          setTokens([])
          setLoading(false)
          return
        }

        console.log('✅ useWalletTokens: Detected tokens:', detectedTokens.map(t => `${t.symbol} (${t.balance})`))

        // Step 2: Get CoinGecko IDs for price fetching
        const coingeckoIds = getCoingeckoIdsFromTokens(detectedTokens)
        console.log('🔍 useWalletTokens: Fetching prices for CoinGecko IDs:', coingeckoIds)

        // Step 3: Fetch prices for detected tokens
        const prices = await getTokenPricesByIds(coingeckoIds)
        console.log('✅ useWalletTokens: Fetched prices:', prices)

        // Step 4: Combine token data with prices
        const tokensWithPrices: TokenWithPrice[] = detectedTokens.map(token => {
          const priceUSD = token.coingeckoId ? (prices[token.coingeckoId] || 0) : 0
          const valueUSD = parseFloat(token.balance) * priceUSD

          return {
            ...token,
            priceUSD,
            valueUSD
          }
        })

        console.log('✅ useWalletTokens: Final tokens with prices:', tokensWithPrices.map(t => `${t.symbol}: $${t.valueUSD.toFixed(2)}`))
        setTokens(tokensWithPrices)

      } catch (err) {
        console.error('❌ useWalletTokens: Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to detect wallet tokens')
        setTokens([])
      } finally {
        setLoading(false)
      }
    }

    detectAndPriceTokens()

    // Refresh every 5 minutes
    const interval = setInterval(detectAndPriceTokens, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [address, network])

  // Helper functions
  const getTotalValueUSD = () => {
    return tokens.reduce((total, token) => total + token.valueUSD, 0)
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

  return {
    tokens,
    loading,
    error,
    getTotalValueUSD,
    getTokenBySymbol,
    getNativeToken,
    getERC20Tokens,
    hasTokens: tokens.length > 0
  }
}