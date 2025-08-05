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

      // For demo purposes, show some realistic portfolio data when wallet is connected
      // In a real implementation, this would fetch actual balances from the blockchain
      const mockTokens: PortfolioToken[] = []
      
      // Get ETH balance for current chain if supported
      const ethBalance = Math.random() * 2 + 0.1 // Random ETH between 0.1-2.1
      if (ethBalance > 0.01) {
        mockTokens.push({
          token: {
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            chainId: 1
          },
          balance: BigInt(Math.floor(ethBalance * 1e18).toString()),
          formattedBalance: ethBalance.toFixed(4),
          usdValue: (ethBalance * 2500).toFixed(2), // Assume $2500/ETH
          chainId: 1,
          chainName: 'Ethereum'
        })
      }

      // Maybe add some USDC if user "has" some
      const usdcBalance = Math.random() * 1000
      if (usdcBalance > 10) {
        mockTokens.push({
          token: {
            address: '0xA0b86a33E6441E7e3c4fb0c2f1F8d7A9a8F6A8A6',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            chainId: 1
          },
          balance: BigInt(Math.floor(usdcBalance * 1e6).toString()),
          formattedBalance: usdcBalance.toFixed(2),
          usdValue: usdcBalance.toFixed(2), // 1:1 with USD
          chainId: 1,
          chainName: 'Ethereum'
        })
      }

      const totalUsdValue = mockTokens.reduce((sum, token) => sum + parseFloat(token.usdValue), 0)
      const totalTokens = mockTokens.length

      const chainBreakdown = totalTokens > 0 ? [
        {
          chainId: 1,
          chainName: 'Ethereum',
          usdValue: totalUsdValue,
          tokenCount: totalTokens
        }
      ] : []

      return {
        tokens: mockTokens,
        totalUsdValue,
        totalTokens,
        chainBreakdown
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