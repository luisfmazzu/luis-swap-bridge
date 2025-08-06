'use client'

import { ReactNode } from 'react'
import { TurnkeyProvider as TurnkeySDKProvider } from '@turnkey/sdk-react'
import { EthereumWallet } from "@turnkey/wallet-stamper"
import { turnkeyConfig } from '@/lib/turnkey-config'

interface TurnkeyProviderProps {
  children: ReactNode
}

const wallet = new EthereumWallet()

// Helper to get current hostname in runtime; falls back to configured value during SSR.
const getRuntimeRpId = () =>
  typeof window !== "undefined"
    ? window.location.hostname
    : turnkeyConfig.passkey.rpId

export function TurnkeyProvider({ children }: TurnkeyProviderProps) {
  // Log all Turnkey environment variables for debugging
  console.log('🔧 TurnkeyProvider: Environment Variables Check')
  console.log('📊 NEXT_PUBLIC_TURNKEY_API_BASE_URL:', process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL)
  console.log('🏢 NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID:', process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID)
  console.log('🔑 NEXT_PUBLIC_TURNKEY_RP_ID:', process.env.NEXT_PUBLIC_TURNKEY_RP_ID)
  console.log('🔒 TURNKEY_API_PUBLIC_KEY exists:', !!process.env.TURNKEY_API_PUBLIC_KEY)
  console.log('🔐 TURNKEY_API_PRIVATE_KEY exists:', !!process.env.TURNKEY_API_PRIVATE_KEY)
  console.log('🌐 NEXT_PUBLIC_ALCHEMY_API_KEY exists:', !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
  
  const config = {
    rpId: getRuntimeRpId(),
    apiBaseUrl: turnkeyConfig.apiBaseUrl,
    defaultOrganizationId: turnkeyConfig.organizationId,
    wallet: wallet,
  }
  
  console.log('⚙️ TurnkeyProvider: Final Config')
  console.log('🆔 rpId:', config.rpId)
  console.log('🌐 apiBaseUrl:', config.apiBaseUrl)  
  console.log('🏢 defaultOrganizationId:', config.defaultOrganizationId)
  console.log('💼 wallet initialized:', !!config.wallet)
  
  // Validate critical configuration
  if (!config.defaultOrganizationId) {
    console.error('❌ TurnkeyProvider: CRITICAL ERROR - defaultOrganizationId is empty!')
    console.error('❌ Make sure NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID is set in your .env file')
  }
  
  if (!config.apiBaseUrl) {
    console.error('❌ TurnkeyProvider: CRITICAL ERROR - apiBaseUrl is empty!')
  }
  
  return (
    <TurnkeySDKProvider config={config}>
      {children}
    </TurnkeySDKProvider>
  )
}

export default TurnkeyProvider