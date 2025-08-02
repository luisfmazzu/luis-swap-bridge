'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi, type Address, maxUint256 } from 'viem'
import { type Token } from '@/lib/constants/tokens'

interface UseTokenAllowanceProps {
  token?: Token
  owner?: Address
  spender?: Address
  enabled?: boolean
}

export function useTokenAllowance({
  token,
  owner,
  spender,
  enabled = true,
}: UseTokenAllowanceProps) {
  // Read current allowance
  const { 
    data: allowance, 
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance 
  } = useReadContract({
    address: token?.address !== '0x0000000000000000000000000000000000000000' ? token?.address : undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    chainId: token?.chainId,
    query: {
      enabled: enabled && !!token && !!owner && !!spender && token.address !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 10000,
    },
  })

  // Write contract for approve
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract()

  // Wait for approve transaction
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Helper function to approve tokens
  const approveToken = async (amount?: bigint) => {
    if (!token || !spender || token.address === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid token or spender')
    }

    const approveAmount = amount || maxUint256 // Default to max approval

    await approve({
      address: token.address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, approveAmount],
      chainId: token.chainId,
    })
  }

  // Helper function to approve max amount
  const approveMax = () => approveToken(maxUint256)

  // Helper function to revoke approval (set to 0)
  const revokeApproval = () => approveToken(0n)

  // Check if allowance is sufficient for a specific amount
  const isAllowanceSufficient = (requiredAmount: bigint) => {
    if (!allowance) return false
    return allowance >= requiredAmount
  }

  // Check if token needs approval for a specific amount
  const needsApproval = (requiredAmount: bigint) => {
    return !isAllowanceSufficient(requiredAmount)
  }

  return {
    // Data
    allowance: allowance || 0n,
    
    // Loading states
    isLoadingAllowance,
    isApprovePending,
    isApproveConfirming,
    
    // Success states
    isApproveConfirmed,
    
    // Errors
    approveError,
    approveReceiptError,
    
    // Actions
    approveToken,
    approveMax,
    revokeApproval,
    refetchAllowance,
    
    // Utilities
    isAllowanceSufficient,
    needsApproval,
    
    // Transaction hash
    approveHash,
  }
}

// Hook for managing multiple token allowances
export function useMultiTokenAllowance({
  tokens,
  owner,
  spender,
  enabled = true,
}: {
  tokens: Token[]
  owner?: Address
  spender?: Address
  enabled?: boolean
}) {
  const allowances = tokens.map(token => 
    useTokenAllowance({
      token,
      owner,
      spender,
      enabled,
    })
  )

  const isLoading = allowances.some(a => a.isLoadingAllowance)
  const isAnyApproving = allowances.some(a => a.isApprovePending || a.isApproveConfirming)

  return {
    allowances,
    isLoading,
    isAnyApproving,
    
    // Helper to approve all tokens
    approveAllMax: async () => {
      const promises = allowances.map(a => a.approveMax())
      await Promise.all(promises)
    },
  }
}

// Hook for smart approval management (approve only if needed)
export function useSmartApproval({
  token,
  owner,
  spender,
  amount,
  enabled = true,
}: {
  token?: Token
  owner?: Address
  spender?: Address
  amount?: bigint
  enabled?: boolean
}) {
  const {
    allowance,
    isLoadingAllowance,
    approveToken,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    needsApproval,
    approveError,
  } = useTokenAllowance({
    token,
    owner,
    spender,
    enabled,
  })

  // Check if we need approval for the specific amount
  const requiresApproval = amount ? needsApproval(amount) : false

  // Smart approve function that only approves if needed
  const smartApprove = async () => {
    if (!amount || !requiresApproval) return

    // Approve 2x the required amount to reduce future approvals
    const approveAmount = amount * 2n
    await approveToken(approveAmount)
  }

  return {
    allowance,
    requiresApproval,
    isLoadingAllowance,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    smartApprove,
  }
}