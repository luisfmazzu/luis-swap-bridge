"use server"

import { ApiKeyStamper, TurnkeyServerClient, DEFAULT_ETHEREUM_ACCOUNTS } from "@turnkey/sdk-server"
import { OtpType } from "@turnkey/sdk-react"
import { decode, JwtPayload } from "jsonwebtoken"
import { getAddress } from "viem"

const stamper = new ApiKeyStamper({
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
})

console.log('🔧 TurnkeyServerClient: Initializing with config:')
console.log('📊 API Base URL:', 'https://api.turnkey.com')
console.log('🏢 Organization ID:', process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID)
console.log('🔑 API Public Key exists:', !!process.env.TURNKEY_API_PUBLIC_KEY)
console.log('🔐 API Private Key exists:', !!process.env.TURNKEY_API_PRIVATE_KEY)

const client = new TurnkeyServerClient({
  apiBaseUrl: 'https://api.turnkey.com',
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  stamper,
})


function decodeJwt(credential: string): JwtPayload | null {
  try {
    const decoded = decode(credential)
    console.log('📝 Turnkey Server Action: Raw decoded JWT:', decoded)
    if (decoded && typeof decoded === "object") {
      // Check for required fields
      if ('sub' in decoded && decoded.sub) {
        console.log('✅ Turnkey Server Action: JWT has required sub field:', decoded.sub)
        return decoded as JwtPayload
      } else {
        console.error('❌ Turnkey Server Action: JWT missing required sub field')
        console.error('❌ Turnkey Server Action: Available fields:', Object.keys(decoded))
      }
    }
    return null
  } catch (error) {
    console.error('❌ Turnkey Server Action: Failed to decode JWT:', error)
    return null
  }
}

export async function createUserSubOrg({
  email,
  passkey,
  oauth,
  wallet,
  credentialBundle,
}: {
  email?: string
  passkey?: {
    challenge: string
    attestation: {
      credentialId: string
      clientDataJson: string
      attestationObject: string
      transports: string[]
    }
  }
  oauth?: {
    providerName: string
    oidcToken: string
  }
  wallet?: {
    publicKey: string
    type: 'ethereum' | 'solana'
  }
  credentialBundle?: string
}) {
  console.log('🏗️ Turnkey Server Action: Creating user sub-organization')
  console.log('🏗️ Turnkey Server Action: Email:', email)
  console.log('🏗️ Turnkey Server Action: Has passkey:', !!passkey)
  console.log('🏗️ Turnkey Server Action: Has oauth:', !!oauth)
  console.log('🏗️ Turnkey Server Action: Has wallet:', !!wallet)
  const authenticators = passkey
    ? [
        {
          authenticatorName: "Passkey",
          challenge: passkey.challenge,
          attestation: passkey.attestation,
        },
      ]
    : []
  console.log('🔐 Turnkey Server Action: Authenticators prepared:', authenticators.length)

  const oauthProviders = oauth
    ? [
        {
          providerName: oauth.providerName,
          oidcToken: oauth.oidcToken,
        },
      ]
    : []
  console.log('🔵 Turnkey Server Action: OAuth providers prepared:', oauthProviders.length)
  if (oauth) {
    console.log('🔵 Turnkey Server Action: OAuth provider:', oauth.providerName)
    console.log('🔵 Turnkey Server Action: OAuth token preview:', oauth.oidcToken.substring(0, 50) + '...')
  }

  const apiKeys = wallet
    ? [
        {
          apiKeyName: "Wallet Auth - Embedded Wallet",
          publicKey: wallet.publicKey,
          curveType:
            wallet.type === 'ethereum'
              ? ("API_KEY_CURVE_SECP256K1" as const)
              : ("API_KEY_CURVE_ED25519" as const),
        },
      ]
    : []
  console.log('🔑 Turnkey Server Action: API keys prepared:', apiKeys.length)
  if (wallet) {
    console.log('🔑 Turnkey Server Action: Wallet type:', wallet.type)
    console.log('🔑 Turnkey Server Action: Wallet public key preview:', wallet.publicKey.substring(0, 20) + '...')
  }

  let userEmail = email
  // If using OAuth, extract email from OIDC token
  if (oauth) {
    console.log('📝 Turnkey Server Action: Decoding JWT token for email')
    const decoded = decodeJwt(oauth.oidcToken)
    console.log('📝 Turnkey Server Action: Decoded JWT:', decoded)
    if (decoded?.email) {
      userEmail = decoded.email as string
      console.log('📝 Turnkey Server Action: Extracted email from JWT:', userEmail)
    } else {
      console.log('⚠️ Turnkey Server Action: No email found in JWT token')
    }
  }

  if (!userEmail) {
    console.error('❌ Turnkey Server Action: No email provided for user creation')
    throw new Error("Email is required for user creation")
  }
  console.log('✅ Turnkey Server Action: Using email for user creation:', userEmail)

  // Create unique sub-organization name
  const subOrgName = `user-${userEmail.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`
  console.log('🏷️ Turnkey Server Action: Generated sub-organization name:', subOrgName)

  console.log('🚀 Turnkey Server Action: Calling Turnkey API to create sub-organization')
  console.log('🚀 Turnkey Server Action: Sub-org config:', {
    subOrganizationName: subOrgName,
    rootQuorumThreshold: 1,
    rootUsersCount: 1,
    authenticatorsCount: authenticators.length,
    oauthProvidersCount: oauthProviders.length,
    apiKeysCount: apiKeys.length
  })
  
  const result = await client.createSubOrganization({
    subOrganizationName: subOrgName,
    rootQuorumThreshold: 1,
    rootUsers: [
      {
        userName: userEmail,
        userEmail: userEmail,
        authenticators: authenticators as any,
        oauthProviders,
        apiKeys,
      },
    ],
    wallet: {
      walletName: "Default ETH Wallet",
      accounts: DEFAULT_ETHEREUM_ACCOUNTS,
    },
  })
  
  console.log('✅ Turnkey Server Action: Sub-organization creation result:', result)

  if (!result.subOrganizationId || !result.wallet) {
    console.error('❌ Turnkey Server Action: Missing required fields in result')
    console.error('❌ Turnkey Server Action: Has subOrganizationId:', !!result.subOrganizationId)
    console.error('❌ Turnkey Server Action: Has wallet:', !!result.wallet)
    throw new Error("Failed to create sub-organization or wallet")
  }

  const returnValue = {
    organizationId: result.subOrganizationId,
    organizationName: subOrgName,
    userId: result.rootUserIds?.[0] || 'unknown-user',
    username: userEmail,
    walletId: result.wallet.walletId,
    addresses: result.wallet.addresses,
  }
  
  console.log('🎉 Turnkey Server Action: Returning user data:', returnValue)
  return returnValue
}

export async function getSubOrgId(userId: string): Promise<string | null> {
  try {
    console.log('🔍 Turnkey Server Action: Getting sub-org ID for user:', userId)
    const result = await client.getUser({ userId })
    console.log('✅ Turnkey Server Action: Get user result:', result)
    const email = result.user?.userEmail || null
    console.log('🔍 Turnkey Server Action: Extracted email:', email)
    return email
  } catch (error) {
    console.error('❌ Turnkey Server Action: Error getting sub-org ID:', error)
    return null
  }
}

export async function getSubOrgIdByEmail(email: string): Promise<string | null> {
  try {
    console.log('🔍 Turnkey Server Action: Getting sub-org ID by email:', email)
    // Search for existing user by email
    const result = await client.getUsers({})
    console.log('✅ Turnkey Server Action: Get users result, count:', result.users?.length || 0)
    const user = result.users?.find(u => u.userEmail === email)
    console.log('🔍 Turnkey Server Action: Found user:', user ? 'Yes' : 'No')
    const userId = user?.userId || null
    console.log('🔍 Turnkey Server Action: Returning user ID:', userId)
    return userId
  } catch (error) {
    console.error('❌ Turnkey Server Action: Error getting sub-org ID by email:', error)
    return null
  }
}

const getMagicLinkTemplate = (
  action: string,
  email: string,
  method: string,
  publicKey: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
) =>
  `${baseUrl}/email-${action}?userEmail=${email}&continueWith=${method}&publicKey=${publicKey}&credentialBundle=%s`

export async function initEmailAuth({
  email,
  targetPublicKey,
  baseUrl,
}: {
  email: string
  targetPublicKey: string
  baseUrl: string
}) {
  try {
    console.log('📧 Turnkey Server Action: Initiating email OTP auth for:', email)
    console.log('📧 Turnkey Server Action: Target public key:', targetPublicKey)
    console.log('📧 Turnkey Server Action: Base URL:', baseUrl)
    
    // First, find or create a sub-organization for this user
    let organizationId: string
    try {
      console.log('🔍 Turnkey Server Action: Checking for existing sub-org...')
      const existingOrgId = await Promise.race([
        getSubOrgIdByEmail(email),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 10s')), 10000))
      ]) as string | null
      
      if (existingOrgId) {
        organizationId = existingOrgId
        console.log('✅ Turnkey Server Action: Using existing sub-org:', organizationId)
      } else {
        console.log('🏗️ Turnkey Server Action: Creating new sub-org...')
        // Create sub-org first (needed for OTP)
        const newUser = await Promise.race([
          createUserSubOrg({ email }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 15s')), 15000))
        ]) as any
        
        organizationId = newUser.organizationId
        console.log('✅ Turnkey Server Action: Created new sub-org:', organizationId)
      }
    } catch (error) {
      console.error('❌ Turnkey Server Action: Failed to get/create sub-org:', error)
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
      
      if (error instanceof Error && error.message.includes('Timeout')) {
        throw new Error('Turnkey API timeout - please check your network connection and API keys')
      }
      throw error
    }

    const magicLinkTemplate = getMagicLinkTemplate(
      "auth",
      email,
      "email",
      targetPublicKey,
      baseUrl
    )

    if (organizationId?.length) {
      const authResponse = await client.initOtp({
        userIdentifier: targetPublicKey,
        otpType: OtpType.Email,
        contact: email,
        emailCustomization: {
          magicLinkTemplate,
        },
      })
      console.log('✅ Turnkey Server Action: OTP initiated:', authResponse)
      return authResponse
    }
  } catch (error) {
    console.error('❌ Turnkey Server Action: Failed to init email OTP:', error)
    throw new Error(`Failed to init email OTP: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function verifyOtp({
  otpId,
  otpCode,
  publicKey,
}: {
  otpId: string
  otpCode: string
  publicKey: string
}) {
  const authResponse = await client.verifyOtp({
    otpId,
    otpCode,
  })

  return authResponse
}

export async function otpLogin({
  publicKey,
  verificationToken,
  email,
}: {
  publicKey: string
  verificationToken: string
  email: string
}) {
  const subOrgId = await getSubOrgIdByEmail(email)

  if (!subOrgId) {
    throw new Error("Could not find suborg by email")
  }

  const sessionResponse = await client.otpLogin({
    verificationToken,
    publicKey,
    organizationId: subOrgId,
  })

  return {
    userId: sessionResponse.activity.votes[0]?.userId,
    session: sessionResponse.session,
    organizationId: subOrgId,
  }
}

// Simple cache to prevent duplicate requests
const processedBundles = new Map<string, { timestamp: number; promise: Promise<any> }>()

export async function verifyCredentialBundle(credentialBundle: string, email: string) {
  try {
    console.log('🔐 Turnkey Server Action: Verifying credential bundle')
    console.log('🔐 Turnkey Server Action: Email:', email)
    console.log('🔐 Turnkey Server Action: Bundle preview:', credentialBundle.substring(0, 100) + '...')
    
    // Check cache to prevent duplicate processing
    const cacheKey = `${email}:${credentialBundle}`
    const cached = processedBundles.get(cacheKey)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < 60000) { // 1 minute cache
      console.log('🔄 Turnkey Server Action: Using cached verification result')
      return await cached.promise
    }
    
    // Create verification promise and cache it
    const verificationPromise = (async () => {
      // Find the user's sub-organization by email
      const suborgId = await getSubOrgIdByEmail(email)
      if (!suborgId) {
        throw new Error('No sub-organization found for email')
      }
    
    // Get user and wallet information
    const walletsResult = await client.getWallets({ organizationId: suborgId })
    const wallet = walletsResult.wallets?.[0]
    
    // Get user info to extract email
    const usersResult = await client.getUsers({ organizationId: suborgId })
    const user = usersResult.users?.[0]
    
    // Get wallet accounts if wallet exists
    let addresses: string[] = []
    if (wallet?.walletId) {
      try {
        const walletAccountsResult = await client.getWalletAccounts({ 
          organizationId: suborgId,
          walletId: wallet.walletId 
        })
        addresses = walletAccountsResult.accounts?.map((account: any) => account.address) || []
      } catch (error) {
        console.warn('❌ Could not fetch wallet accounts:', error)
        addresses = []
      }
    }
    
    const result = {
      organizationId: suborgId,
      organizationName: `user-${user?.userEmail || 'unknown'}`,
      userId: user?.userId || 'unknown-user',
      username: user?.userEmail || 'unknown',
      walletId: wallet?.walletId || 'no-wallet',
      addresses: addresses,
      credentialBundle: credentialBundle, // Store the credential bundle for client use
    }
    
      console.log('✅ Turnkey Server Action: Credential bundle verification completed:', result)
      return result
    })()
    
    // Cache the promise
    processedBundles.set(cacheKey, { timestamp: now, promise: verificationPromise })
    
    // Clean up old entries
    if (processedBundles.size > 100) {
      const oldestEntries = Array.from(processedBundles.entries())
        .filter(([_, entry]) => (now - entry.timestamp) > 60000)
      oldestEntries.forEach(([key]) => processedBundles.delete(key))
    }
    
    return await verificationPromise
  } catch (error) {
    console.error('❌ Turnkey Server Action: Credential bundle verification failed:', error)
    throw new Error(`Credential bundle verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function oauth(providerName: string, oidcToken: string) {
  try {
    console.log('🔵 Turnkey Server Action: Starting OAuth authentication')
    console.log('🔵 Turnkey Server Action: Provider:', providerName)
    console.log('🔵 Turnkey Server Action: Token preview:', oidcToken.substring(0, 50) + '...')
    
    const result = await createUserSubOrg({
      oauth: {
        providerName,
        oidcToken,
      },
    })
    
    console.log('✅ Turnkey Server Action: OAuth authentication successful:', result)
    return result
  } catch (error) {
    console.error('❌ Turnkey Server Action: OAuth authentication failed:', error)
    throw new Error(`OAuth authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}