'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi'
import { parseUnits, type Address } from 'viem'
import { type Token } from '@/lib/constants/tokens'
import { dexAggregator, type OneInchQuoteResponse, type OneInchSwapResponse, handleDexError } from '@/lib/api/dex-aggregator'
import { useTokenAllowance } from './use-token-allowance'
import { useWeb3 } from './use-web3'

export interface SwapParams {
  fromToken: Token
  toToken: Token
  fromAmount: string
  slippage?: number
}

export interface SwapQuoteData {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  toAmountMin: string
  priceImpact: string
  estimatedGas: string
  route: string[]
  protocols: string[]
}

export function useSwapQuote({
  fromToken,
  toToken,
  fromAmount,
  slippage = 1,
  enabled = true,
}: SwapParams & { enabled?: boolean }) {
  const { chainId } = useWeb3()

  const {
    data: quote,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['swapQuote', chainId, fromToken?.address, toToken?.address, fromAmount, slippage],
    queryFn: async (): Promise<SwapQuoteData | null> => {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        return null
      }

      try {
        const amountWei = parseUnits(fromAmount, fromToken.decimals)
        
        const quoteResponse = await dexAggregator.getQuote({
          chainId: chainId || fromToken.chainId,
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: amountWei.toString(),
          slippage,
        })

        // Calculate minimum amount after slippage
        const toAmountBigInt = BigInt(quoteResponse.toTokenAmount)
        const slippageBasisPoints = BigInt(slippage * 100) // Convert to basis points
        const toAmountMin = toAmountBigInt - (toAmountBigInt * slippageBasisPoints) / 10000n

        // Extract protocol names
        const protocols = quoteResponse.protocols
          .flat()
          .map(p => p.name)
          .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates

        return {
          fromToken,
          toToken,
          fromAmount,
          toAmount: (Number(quoteResponse.toTokenAmount) / Math.pow(10, toToken.decimals)).toString(),
          toAmountMin: (Number(toAmountMin) / Math.pow(10, toToken.decimals)).toString(),
          priceImpact: '0', // Would need market price to calculate actual impact
          estimatedGas: quoteResponse.estimatedGas?.toString() || '0',
          route: [fromToken.symbol, toToken.symbol],
          protocols,
        }
      } catch (error) {
        throw handleDexError(error)
      }
    },
    enabled: enabled && !!fromToken && !!toToken && !!fromAmount && parseFloat(fromAmount) > 0,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  return {
    quote,
    isLoading,
    error,
    refetch,
  }
}

export function useSwap() {
  const { address, chainId } = useWeb3()
  const [isSwapping, setIsSwapping] = useState(false)

  const {
    writeContract: executeSwap,
    data: swapHash,
    isPending: isSwapPending,
    error: swapError,
  } = useWriteContract()

  const {
    isLoading: isSwapConfirming,
    isSuccess: isSwapConfirmed,
    error: swapReceiptError,
  } = useWaitForTransactionReceipt({
    hash: swapHash,
  })

  const swap = useCallback(async ({
    fromToken,
    toToken,
    fromAmount,
    slippage = 1,
  }: SwapParams) => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected')
    }

    setIsSwapping(true)

    try {
      const amountWei = parseUnits(fromAmount, fromToken.decimals)

      const swapData = await dexAggregator.getSwap({
        chainId,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amountWei.toString(),
        fromAddress: address,
        slippage,
      })

      await executeSwap({
        to: swapData.tx.to,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value),
        gas: BigInt(swapData.tx.gas),
        chainId,
      })
    } catch (error) {
      setIsSwapping(false)
      throw handleDexError(error)
    }
  }, [address, chainId, executeSwap])

  // Reset swapping state when transaction is confirmed or fails
  const resetSwapState = useCallback(() => {
    setIsSwapping(false)
  }, [])

  return {
    swap,
    isSwapping: isSwapping || isSwapPending || isSwapConfirming,
    isSwapPending,
    isSwapConfirming,
    isSwapConfirmed,
    swapHash,
    swapError: swapError || swapReceiptError,
    resetSwapState,
  }
}

// Hook for managing swap state and flow
export function useSwapState() {
  const [fromToken, setFromToken] = useState<Token | undefined>()
  const [toToken, setToToken] = useState<Token | undefined>()
  const [fromAmount, setFromAmount] = useState('')
  const [slippage, setSlippage] = useState(1)

  const { address } = useWeb3()

  // Get quote for current parameters
  const { quote, isLoading: isQuoteLoading, error: quoteError } = useSwapQuote({
    fromToken,
    toToken,
    fromAmount,
    slippage,
    enabled: !!fromToken && !!toToken && !!fromAmount,
  })

  // Check token allowance
  const {
    allowance,
    needsApproval,
    approveToken,
    isApprovePending,
    isApproveConfirming,
  } = useTokenAllowance({
    token: fromToken,
    owner: address,
    spender: '0x1111111254EEB25477B68fb85Ed929f73A960582' as Address, // 1inch router v5
    enabled: !!fromToken && !!address,
  })

  // Swap execution
  const { swap, isSwapping, swapHash, swapError } = useSwap()

  // Flip tokens
  const flipTokens = useCallback(() => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(quote?.toAmount || '')
  }, [fromToken, toToken, quote])

  // Check if swap is ready
  const isSwapReady = useMemo(() => {
    return (
      !!fromToken &&
      !!toToken &&
      !!fromAmount &&
      parseFloat(fromAmount) > 0 &&
      !!quote &&
      !!address &&
      !needsApproval(parseUnits(fromAmount || '0', fromToken?.decimals || 18))
    )
  }, [fromToken, toToken, fromAmount, quote, address, needsApproval])

  // Calculate exchange rate
  const exchangeRate = useMemo(() => {
    if (!quote || !fromAmount || parseFloat(fromAmount) === 0) return null

    const rate = parseFloat(quote.toAmount) / parseFloat(fromAmount)
    return {
      rate,
      display: `1 ${quote.fromToken.symbol} = ${rate.toFixed(6)} ${quote.toToken.symbol}`,
    }
  }, [quote, fromAmount])

  return {
    // Token state
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    flipTokens,

    // Amount state
    fromAmount,
    setFromAmount,
    toAmount: quote?.toAmount || '',

    // Settings
    slippage,
    setSlippage,

    // Quote data
    quote,
    isQuoteLoading,
    quoteError,
    exchangeRate,

    // Allowance
    allowance,
    needsApproval: needsApproval(parseUnits(fromAmount || '0', fromToken?.decimals || 18)),
    approveToken,
    isApprovePending,
    isApproveConfirming,

    // Swap
    swap: () => swap({ fromToken: fromToken!, toToken: toToken!, fromAmount, slippage }),
    isSwapping,
    isSwapReady,
    swapHash,
    swapError,
  }
}