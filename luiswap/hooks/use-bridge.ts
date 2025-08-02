"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { getBridgeRoutes, executeBridgeTransaction } from "@/lib/api/bridge"
import type { Token } from "@/lib/constants/tokens"
import type { BridgeRoute, BridgeQuoteParams } from "@/lib/api/bridge"

interface UseBridgeQuoteParams {
  fromToken: Token | null
  toToken: Token | null
  fromChainId: number
  toChainId: number
  amount: bigint
  enabled?: boolean
}

export function useBridgeQuote({
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  amount,
  enabled = true
}: UseBridgeQuoteParams) {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  
  const queryKey = [
    'bridgeQuote',
    fromToken?.address,
    toToken?.address,
    fromChainId,
    toChainId,
    amount.toString(),
    address
  ]

  const {
    data: routes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<BridgeRoute[]> => {
      if (!fromToken || !toToken || !address || amount === 0n) {
        return []
      }

      const params: BridgeQuoteParams = {
        fromToken,
        toToken,
        fromChainId,
        toChainId,
        amount,
        userAddress: address
      }

      return await getBridgeRoutes(params)
    },
    enabled: enabled && !!fromToken && !!toToken && !!address && amount > 0n,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    retry: 2
  })

  const bridgeMutation = useMutation({
    mutationFn: async ({ route, userAddress }: { route: BridgeRoute; userAddress: string }) => {
      return await executeBridgeTransaction(route, userAddress)
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] })
      queryClient.invalidateQueries({ queryKey: ['bridgeQuote'] })
    }
  })

  const executeBridge = useCallback(async (route: BridgeRoute, userAddress: string) => {
    return bridgeMutation.mutateAsync({ route, userAddress })
  }, [bridgeMutation])

  return {
    routes,
    isLoading,
    error,
    refetch,
    executeBridge,
    isExecuting: bridgeMutation.isPending
  }
}

export function useBridgeHistory(userAddress?: string) {
  return useQuery({
    queryKey: ['bridgeHistory', userAddress],
    queryFn: async () => {
      // This would integrate with a bridge history API
      // For now, return empty array
      return []
    },
    enabled: !!userAddress,
    staleTime: 60000, // 1 minute
  })
}

interface UseBridgeTransactionParams {
  txHash: string
  chainId: number
  enabled?: boolean
}

export function useBridgeTransaction({ txHash, chainId, enabled = true }: UseBridgeTransactionParams) {
  const publicClient = usePublicClient({ chainId })
  
  return useQuery({
    queryKey: ['bridgeTransaction', txHash, chainId],
    queryFn: async () => {
      if (!publicClient) return null
      
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
        return receipt
      } catch (error) {
        console.error('Failed to fetch transaction:', error)
        return null
      }
    },
    enabled: enabled && !!txHash && !!publicClient,
    staleTime: 300000, // 5 minutes for completed transactions
    retry: 3,
    retryDelay: 2000
  })
}

export function useBridgeAllowance(
  token: Token | null,
  userAddress: string | undefined,
  spenderAddress: string,
  chainId: number
) {
  const publicClient = usePublicClient({ chainId })

  return useQuery({
    queryKey: ['bridgeAllowance', token?.address, userAddress, spenderAddress, chainId],
    queryFn: async (): Promise<bigint> => {
      if (!token || !userAddress || !publicClient || token.address === "0x0000000000000000000000000000000000000000") {
        return 0n
      }

      try {
        const allowance = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: [
            {
              name: 'allowance',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' }
              ],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'allowance',
          args: [userAddress as `0x${string}`, spenderAddress as `0x${string}`]
        })

        return allowance as bigint
      } catch (error) {
        console.error('Failed to fetch allowance:', error)
        return 0n
      }
    },
    enabled: !!token && !!userAddress && !!publicClient && token.address !== "0x0000000000000000000000000000000000000000",
    staleTime: 30000, // 30 seconds
  })
}

export function useApproveBridge() {
  const { data: walletClient } = useWalletClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      token, 
      spenderAddress, 
      amount 
    }: { 
      token: Token
      spenderAddress: string
      amount: bigint 
    }) => {
      if (!walletClient) {
        throw new Error('Wallet not connected')
      }

      const hash = await walletClient.writeContract({
        address: token.address as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, amount]
      })

      return hash
    },
    onSuccess: () => {
      // Invalidate allowance queries
      queryClient.invalidateQueries({ queryKey: ['bridgeAllowance'] })
    }
  })
}