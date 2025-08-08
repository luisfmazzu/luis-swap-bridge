'use client'

import { ReactNode } from 'react'
import { ClientWrapper } from './client-wrapper'
import { Web3Provider } from '@/providers/web3-provider'

interface DynamicWeb3ProviderProps {
  children: ReactNode
}

// Simplified dynamic provider - no more complex loading states
export function DynamicWeb3Provider({ children }: DynamicWeb3ProviderProps) {
  return (
    <ClientWrapper>
      <Web3Provider>
        {children}
      </Web3Provider>
    </ClientWrapper>
  )
}