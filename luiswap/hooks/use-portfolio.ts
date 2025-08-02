"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useTokenBalance } from "./use-token-balance"
import { SUPPORTED_CHAINS, getAllTokens } from "@/lib/constants/tokens"
import type { Token } from "@/lib/constants/tokens"

interface PortfolioToken {
  token: Token
  balance: bigint
  formattedBalance: string
  usdValue: string
  chainId: number
  chainName: string
}

interface PortfolioData {
  tokens: PortfolioToken[]
  totalUsdValue: number
  totalTokens: number
  chainBreakdown: Array<{
    chainId: number
    chainName: string
    usdValue: number
    tokenCount: number
  }>
}

export function usePortfolio() {
  const { address, isConnected } = useAccount()
  const allTokens = getAllTokens()

  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: async (): Promise<PortfolioData> => {
      if (!address || !isConnected) {
        return {
          tokens: [],
          totalUsdValue: 0,
          totalTokens: 0,
          chainBreakdown: []
        }
      }

      const portfolioTokens: PortfolioToken[] = []
      const chainBalances = new Map<number, { usdValue: number; tokenCount: number }>()

      // Fetch balances for all tokens across all chains
      const balancePromises = SUPPORTED_CHAINS.flatMap(chain => 
        allTokens
          .filter(token => token.chainId === chain.id)
          .map(async (token) => {
            try {
              // This is a simplified approach - in a real implementation,
              // you'd want to batch these requests for efficiency
              const response = await fetch(`/api/balance/${chain.id}/${token.address}/${address}`)
              const data = await response.json()
              
              if (data.balance && BigInt(data.balance) > 0n) {
                const formattedBalance = (Number(data.balance) / Math.pow(10, token.decimals)).toFixed(4)
                const usdValue = data.usdValue || "0"
                
                const portfolioToken: PortfolioToken = {
                  token,
                  balance: BigInt(data.balance),
                  formattedBalance,
                  usdValue,
                  chainId: chain.id,
                  chainName: chain.name
                }

                portfolioTokens.push(portfolioToken)

                // Update chain breakdown
                const currentChainData = chainBalances.get(chain.id) || { usdValue: 0, tokenCount: 0 }
                chainBalances.set(chain.id, {
                  usdValue: currentChainData.usdValue + parseFloat(usdValue),
                  tokenCount: currentChainData.tokenCount + 1
                })
              }
            } catch (error) {
              // Silently handle errors for individual token fetches
              console.warn(`Failed to fetch balance for ${token.symbol} on ${chain.name}:`, error)
            }
          })
      )

      await Promise.allSettled(balancePromises)

      const totalUsdValue = portfolioTokens.reduce((sum, token) => sum + parseFloat(token.usdValue), 0)
      const totalTokens = portfolioTokens.length

      const chainBreakdown = Array.from(chainBalances.entries()).map(([chainId, data]) => ({
        chainId,
        chainName: SUPPORTED_CHAINS.find(chain => chain.id === chainId)?.name || "Unknown",
        usdValue: data.usdValue,
        tokenCount: data.tokenCount
      }))

      return {
        tokens: portfolioTokens.sort((a, b) => parseFloat(b.usdValue) - parseFloat(a.usdValue)),
        totalUsdValue,
        totalTokens,
        chainBreakdown: chainBreakdown.sort((a, b) => b.usdValue - a.usdValue)
      }
    },
    enabled: !!address && isConnected,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchInterval: 120000, // Refetch every 2 minutes
  })
}

export function usePortfolioHistory(days: number = 7) {
  const { address, isConnected } = useAccount()

  return useQuery({
    queryKey: ['portfolioHistory', address, days],
    queryFn: async () => {
      if (!address || !isConnected) return []

      // This would integrate with a price history API
      // For now, generate mock data
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      return Array.from({ length: days }, (_, i) => ({
        timestamp: now - (days - 1 - i) * dayMs,
        totalValue: Math.random() * 10000 + 5000, // Mock data
        change24h: (Math.random() - 0.5) * 200, // Mock data
      }))
    },
    enabled: !!address && isConnected,
    staleTime: 300000, // 5 minutes
  })
}

interface TokenPrice {
  symbol: string
  price: number
  change24h: number
  change7d: number
}

export function useTokenPrices(tokenSymbols: string[]) {
  return useQuery({
    queryKey: ['tokenPrices', tokenSymbols.sort()],
    queryFn: async (): Promise<TokenPrice[]> => {
      if (tokenSymbols.length === 0) return []

      try {
        // This would integrate with a price API like CoinGecko
        // For now, return mock data
        return tokenSymbols.map(symbol => ({
          symbol,
          price: Math.random() * 100 + 1,
          change24h: (Math.random() - 0.5) * 20,
          change7d: (Math.random() - 0.5) * 50,
        }))
      } catch (error) {
        console.error('Failed to fetch token prices:', error)
        return []
      }
    },
    enabled: tokenSymbols.length > 0,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  })
}

export function useTokenPerformance(tokenAddress: string, chainId: number, days: number = 30) {
  return useQuery({
    queryKey: ['tokenPerformance', tokenAddress, chainId, days],
    queryFn: async () => {
      // This would integrate with a price history API
      // For now, generate mock historical data
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      return Array.from({ length: days }, (_, i) => ({
        timestamp: now - (days - 1 - i) * dayMs,
        price: Math.random() * 10 + 1,
        volume: Math.random() * 1000000,
      }))
    },
    enabled: !!tokenAddress && !!chainId,
    staleTime: 300000, // 5 minutes
  })
}