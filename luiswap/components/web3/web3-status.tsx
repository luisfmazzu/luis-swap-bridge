'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/hooks/use-web3'
import { ClientWrapper } from './client-wrapper'

interface Web3StatusProps {
  children: (status: {
    isConnected: boolean
    isConnecting: boolean
    address?: string
    chainId?: number
    isChainSupported: boolean
  }) => React.ReactNode
  fallback?: React.ReactNode
}

function Web3StatusContent({ children }: Omit<Web3StatusProps, 'fallback'>) {
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    isChainSupported,
  } = useWeb3()

  return (
    <>
      {children({
        isConnected,
        isConnecting,
        address,
        chainId,
        isChainSupported,
      })}
    </>
  )
}

export function Web3Status({ children, fallback }: Web3StatusProps) {
  return (
    <ClientWrapper fallback={fallback}>
      <Web3StatusContent>
        {children}
      </Web3StatusContent>
    </ClientWrapper>
  )
}