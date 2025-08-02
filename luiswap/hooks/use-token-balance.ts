'use client'

import { useBalance, useReadContract } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatUnits, type Address } from 'viem'
import { erc20Abi } from 'viem'
import { type Token } from '@/lib/constants/tokens'

// ERC20 Token Balance Hook
export function useTokenBalance({
  address,
  token,
  enabled = true,
}: {
  address?: Address
  token?: Token
  enabled?: boolean
}) {
  // For native tokens (ETH, MATIC, BNB, etc.)
  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
    address,
    chainId: token?.chainId,
    query: {
      enabled: enabled && !!address && token?.address === '0x0000000000000000000000000000000000000000',
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  // For ERC20 tokens
  const { data: erc20Balance, isLoading: isERC20Loading } = useReadContract({
    address: token?.address !== '0x0000000000000000000000000000000000000000' ? token?.address : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: token?.chainId,
    query: {
      enabled: enabled && !!address && !!token && token.address !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 10000,
    },
  })

  const isNativeToken = token?.address === '0x0000000000000000000000000000000000000000'
  const rawBalance = isNativeToken ? nativeBalance?.value : erc20Balance
  const isLoading = isNativeToken ? isNativeLoading : isERC20Loading

  // Format the balance
  const formattedBalance = rawBalance && token 
    ? formatUnits(rawBalance, token.decimals)
    : '0'

  const balance = {
    raw: rawBalance || 0n,
    formatted: formattedBalance,
    decimals: token?.decimals || 18,
    symbol: token?.symbol || '',
    token,
  }

  return {
    balance,
    isLoading,
    isError: false, // We can add error handling later
    refetch: () => {}, // Placeholder for refetch function
  }
}

// Multiple Token Balances Hook
export function useTokenBalances({
  address,
  tokens,
  enabled = true,
}: {
  address?: Address
  tokens: Token[]
  enabled?: boolean
}) {
  const balanceQueries = tokens.map((token) => ({
    queryKey: ['tokenBalance', address, token.address, token.chainId],
    queryFn: async () => {
      if (!address) return null
      
      // This is a simplified version - in production you'd batch these calls
      // For now, we'll use the individual hook logic
      return {
        token,
        balance: '0', // Placeholder
        raw: 0n,
      }
    },
    enabled: enabled && !!address,
    refetchInterval: 10000,
  }))

  const { data: balances, isLoading } = useQuery({
    queryKey: ['multipleTokenBalances', address, tokens.map(t => `${t.address}-${t.chainId}`).join(',')],
    queryFn: async () => {
      if (!address || !tokens.length) return []
      
      // In production, you'd use a multicall contract or batch RPC calls
      // For now, return placeholder data
      return tokens.map(token => ({
        token,
        balance: '0',
        raw: 0n,
        formattedBalance: '0.00',
      }))
    },
    enabled: enabled && !!address && tokens.length > 0,
    refetchInterval: 10000,
  })

  return {
    balances: balances || [],
    isLoading,
    isError: false,
  }
}

// Hook for getting USD value of token balance
export function useTokenBalanceUSD({
  balance,
  token,
}: {
  balance?: string
  token?: Token
}) {
  const { data: usdValue, isLoading } = useQuery({
    queryKey: ['tokenUSD', token?.symbol, balance],
    queryFn: async () => {
      if (!token || !balance || balance === '0') return 0

      // In production, you'd integrate with a price API like CoinGecko
      // For now, assume stablecoins are $1
      const stablecoinSymbols = ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD', 'BUSD']
      if (stablecoinSymbols.includes(token.symbol)) {
        return parseFloat(balance)
      }

      // For other tokens, return 0 for now
      return 0
    },
    enabled: !!token && !!balance && balance !== '0',
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return {
    usdValue: usdValue || 0,
    isLoading,
    formatted: usdValue ? `$${usdValue.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}` : '$0.00',
  }
}

// Utility hook for formatting token amounts
export function useTokenFormatter() {
  const formatTokenAmount = (
    amount: string | number,
    decimals: number = 18,
    displayDecimals: number = 6
  ) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (num === 0) return '0'
    if (num < 0.000001) return '< 0.000001'
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    })
  }

  const formatCompactAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    
    return formatTokenAmount(num)
  }

  return {
    formatTokenAmount,
    formatCompactAmount,
  }
}