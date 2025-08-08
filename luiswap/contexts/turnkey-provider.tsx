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
  // Initialize Turnkey configuration
  
  const config = {
    rpId: getRuntimeRpId(),
    apiBaseUrl: turnkeyConfig.apiBaseUrl,
    defaultOrganizationId: turnkeyConfig.organizationId,
    wallet: wallet,
  }
  
  
  // Validate critical configuration
  if (!config.defaultOrganizationId) {
    console.error('❌ TurnkeyProvider: CRITICAL ERROR - defaultOrganizationId is empty!')
    console.error('❌ Make sure NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID is set in your .env file')
    
    // Return error state instead of broken provider
    return (
      <div style={{ padding: '20px', background: '#ff0000', color: 'white', margin: '20px' }}>
        <h3>Turnkey Configuration Error</h3>
        <p>NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID is missing from environment variables.</p>
        <p>Please check your .env file and restart the server.</p>
      </div>
    )
  }
  
  if (!config.apiBaseUrl) {
    console.error('❌ TurnkeyProvider: CRITICAL ERROR - apiBaseUrl is empty!')
    
    return (
      <div style={{ padding: '20px', background: '#ff0000', color: 'white', margin: '20px' }}>
        <h3>Turnkey Configuration Error</h3>
        <p>NEXT_PUBLIC_TURNKEY_API_BASE_URL is missing from environment variables.</p>
        <p>Please check your .env file and restart the server.</p>
      </div>
    )
  }
  
  
  return (
    <TurnkeySDKProvider config={config}>
      {children}
    </TurnkeySDKProvider>
  )
}

export default TurnkeyProvider