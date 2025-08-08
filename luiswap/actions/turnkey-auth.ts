"use server"

import { ApiKeyStamper, TurnkeyServerClient } from "@turnkey/sdk-server"
import { OtpType } from "@turnkey/sdk-react"  
import { decode, JwtPayload } from "jsonwebtoken"
import { getAddress } from "viem"
import { turnkeyConfig } from "@/lib/turnkey-config"

// Helper function to get initialized Turnkey client
function getTurnkeyClient() {
  console.log('🔧 TurnkeyServerClient: Initializing for passkey auth')
  
  if (!process.env.TURNKEY_API_PUBLIC_KEY || !process.env.TURNKEY_API_PRIVATE_KEY) {
    console.error('❌ FATAL: Missing Turnkey API credentials!')
    throw new Error('Missing Turnkey API credentials. Please check your .env file.')
  }

  if (!turnkeyConfig.organizationId) {
    console.error('❌ FATAL: Missing organizationId in turnkey config!')
    throw new Error('Missing organizationId in turnkey config. Please check your .env file.')
  }

  const stamper = new ApiKeyStamper({
    apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
    apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
  })

  const client = new TurnkeyServerClient({
    apiBaseUrl: turnkeyConfig.apiBaseUrl,
    organizationId: turnkeyConfig.organizationId,
    stamper,
  })
  
  console.log('✅ TurnkeyServerClient: Client created successfully')
  return client
}

export async function createPasskeyUser({
  email,
  challenge,
  attestation,
}: {
  email: string
  challenge: string
  attestation: {
    credentialId: string
    clientDataJson: string
    attestationObject: string
    transports: string[]
  }
}) {
  console.log('🏗️ Turnkey Passkey Auth: Creating user sub-organization')
  console.log('🏗️ Email:', email)
  console.log('🏗️ Challenge length:', challenge.length)
  console.log('🏗️ Credential ID:', attestation.credentialId)

  try {
    const client = getTurnkeyClient()
    
    const authenticators = [{
      authenticatorName: "Passkey",
      challenge: challenge,
      attestation: attestation,
    }]

    // Create unique sub-organization name
    const subOrgName = `user-${email.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`
    console.log('🏷️ Generated sub-organization name:', subOrgName)

    console.log('🚀 Calling Turnkey API to create sub-organization')
    const result = await client.createSubOrganization({
      organizationId: turnkeyConfig.organizationId,
      subOrganizationName: subOrgName,
      rootQuorumThreshold: 1,
      rootUsers: [{
        userName: email,
        userEmail: email,
        authenticators: authenticators as any,
        oauthProviders: [],
        apiKeys: [],
      }],
      wallet: {
        walletName: "Multi-Chain Wallet",
        accounts: [
          // Ethereum-compatible account (works for Ethereum and Celo)
          {
            curve: "CURVE_SECP256K1",
            pathFormat: "PATH_FORMAT_BIP32", 
            path: "m/44'/60'/0'/0/0", // Ethereum derivation path
            addressFormat: "ADDRESS_FORMAT_ETHEREUM",
          },
          // TRON account
          {
            curve: "CURVE_SECP256K1",
            pathFormat: "PATH_FORMAT_BIP32",
            path: "m/44'/195'/0'/0/0", // TRON derivation path
            addressFormat: "ADDRESS_FORMAT_TRON",
          },
        ],
      },
    })

    console.log('✅ Sub-organization creation result received')

    if (!result.subOrganizationId || !result.wallet) {
      console.error('❌ Missing required fields in result')
      throw new Error("Failed to create sub-organization or wallet")
    }

    const returnValue = {
      organizationId: result.subOrganizationId,
      organizationName: subOrgName,
      userId: result.rootUserIds?.[0] || 'unknown-user',
      username: email,
      walletId: result.wallet.walletId,
      addresses: result.wallet.addresses || [],
    }

    console.log('🎉 Returning user data:', returnValue)
    return returnValue
  } catch (error) {
    console.error('❌ Passkey user creation failed:', error)
    throw new Error(`Failed to create passkey user: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}