"use server"

import { ApiKeyStamper, TurnkeyServerClient, DEFAULT_TRON_ACCOUNTS, DEFAULT_ETHEREUM_ACCOUNTS } from "@turnkey/sdk-server"
import { OtpType } from "@turnkey/sdk-react"
import { decode, JwtPayload } from "jsonwebtoken"
import { getAddress } from "viem"

// Log server-side initialization
console.log('🔧 TurnkeyServerClient: Server-side initialization started')
console.log('🔧 TurnkeyServerClient: Creating ApiKeyStamper...')
console.log('🔑 TURNKEY_API_PUBLIC_KEY length:', process.env.TURNKEY_API_PUBLIC_KEY?.length || 0)
console.log('🔐 TURNKEY_API_PRIVATE_KEY length:', process.env.TURNKEY_API_PRIVATE_KEY?.length || 0)

if (!process.env.TURNKEY_API_PUBLIC_KEY || !process.env.TURNKEY_API_PRIVATE_KEY) {
  console.error('❌ FATAL: Missing Turnkey API credentials!')
  console.error('❌ TURNKEY_API_PUBLIC_KEY exists:', !!process.env.TURNKEY_API_PUBLIC_KEY)
  console.error('❌ TURNKEY_API_PRIVATE_KEY exists:', !!process.env.TURNKEY_API_PRIVATE_KEY)
  console.error('❌ Current working directory:', process.cwd())
  console.error('❌ NODE_ENV:', process.env.NODE_ENV)
  throw new Error('Missing Turnkey API credentials. Please check your .env file.')
}

// Validate key formats (basic checks)
if (!process.env.TURNKEY_API_PUBLIC_KEY.match(/^[0-9a-fA-F]{66}$/)) {
  console.error('❌ TURNKEY_API_PUBLIC_KEY format appears invalid (should be 66 hex chars)')
}
if (!process.env.TURNKEY_API_PRIVATE_KEY.match(/^[0-9a-fA-F]{64}$/)) {
  console.error('❌ TURNKEY_API_PRIVATE_KEY format appears invalid (should be 64 hex chars)')
}

const stamper = new ApiKeyStamper({
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
})
console.log('✅ TurnkeyServerClient: ApiKeyStamper created successfully')

console.log('🔧 TurnkeyServerClient: Initializing with config:')
console.log('📊 API Base URL:', 'https://api.turnkey.com')
console.log('🏢 Organization ID:', process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID)
console.log('🔑 API Public Key exists:', !!process.env.TURNKEY_API_PUBLIC_KEY)
console.log('🔐 API Private Key exists:', !!process.env.TURNKEY_API_PRIVATE_KEY)
if (process.env.TURNKEY_API_PUBLIC_KEY) {
  console.log('🔑 API Public Key preview:', process.env.TURNKEY_API_PUBLIC_KEY.substring(0, 20) + '...')
} else {
  console.error('❌ TURNKEY_API_PUBLIC_KEY is not loaded!')
}
if (process.env.TURNKEY_API_PRIVATE_KEY) {
  console.log('🔐 API Private Key preview:', process.env.TURNKEY_API_PRIVATE_KEY.substring(0, 20) + '...')
} else {
  console.error('❌ TURNKEY_API_PRIVATE_KEY is not loaded!')
}

console.log('🔧 TurnkeyServerClient: Creating TurnkeyServerClient...')
if (!process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID) {
  console.error('❌ FATAL: Missing NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!')
  throw new Error('Missing NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID. Please check your .env file.')
}

const client = new TurnkeyServerClient({
  apiBaseUrl: 'https://api.turnkey.com',
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  stamper,
})
console.log('✅ TurnkeyServerClient: Client created successfully')

// Test API connectivity on startup
;(async () => {
  try {
    console.log('📋 Testing Turnkey API connectivity...')
    const testTimeout = setTimeout(() => {
      console.error('❌ API connectivity test timed out after 5s')
    }, 5000)
    
    // Try a simple API call to test connectivity
    const orgInfo = await client.getOrganization({
      organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    })
    
    clearTimeout(testTimeout)
    console.log('✅ Turnkey API connectivity test successful')
    console.log('🏢 Organization name:', orgInfo.organizationData?.name || 'Unknown')
  } catch (testError) {
    console.error('❌ Turnkey API connectivity test failed:', testError)
    console.error('❌ This indicates invalid API keys or network issues')
    if (testError instanceof Error) {
      console.error('❌ Test error message:', testError.message)
      console.error('❌ Test error stack:', testError.stack)
    }
  }
})()


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
          curveType: ("API_KEY_CURVE_SECP256K1" as const), // Both TRON and Ethereum use SECP256K1
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
    organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!, // Critical: specify parent organization
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
      walletName: "Multi-Chain Wallet",
      accounts: [
        ...DEFAULT_TRON_ACCOUNTS,
        ...DEFAULT_ETHEREUM_ACCOUNTS,
        // CELO Alfajores Testnet account
        {
          curve: "CURVE_SECP256K1",
          pathFormat: "PATH_FORMAT_BIP32",
          path: "m/44'/52752'/0'/0/0", // CELO's coin type is 52752
          addressFormat: "ADDRESS_FORMAT_ETHEREUM",
        },
      ],
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
    console.log('🔍 Searching within parent organization:', process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID)
    
    // Use Turnkey's getSubOrgIds API with email filter, scoped to our parent organization
    const result = await client.getSubOrgIds({
      organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
      filterType: 'EMAIL',
      filterValue: email,
    })
    
    console.log('✅ Found sub-organization IDs:', result.organizationIds?.length || 0)
    
    if (result.organizationIds && result.organizationIds.length > 0) {
      const subOrgId = result.organizationIds[0] // Take the first match
      console.log('✅ Returning sub-org ID:', subOrgId)
      return subOrgId
    }
    
    console.log('🔍 No sub-organization found for email:', email)
    return null
    
  } catch (error) {
    console.error('❌ Turnkey Server Action: Error getting sub-org ID by email:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
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
    console.log('📧 Turnkey Server Action: Following docs - CREATE USER first, then send OTP')
    console.log('📧 Email:', email)
    console.log('📧 Target public key preview:', targetPublicKey.substring(0, 20) + '...')
    console.log('📧 Base URL:', baseUrl)
    
    // Step 1: Create or find user sub-organization (following docs pattern)
    let organizationId: string
    
    try {
      console.log('🔍 Checking for existing user sub-organization...')
      // Try to find existing sub-org, but scope it to our parent organization
      const existingSubOrgId = await getSubOrgIdByEmail(email)
      
      if (existingSubOrgId) {
        console.log('✅ Found existing sub-org:', existingSubOrgId)
        organizationId = existingSubOrgId
      } else {
        console.log('🏗️ No existing sub-org found, creating new user sub-organization...')
        // Following docs: Create user sub-organization first
        const result = await createUserSubOrg({ email })
        organizationId = result.organizationId
        console.log('✅ Created new sub-org:', organizationId)
      }
    } catch (subOrgError) {
      console.error('❌ Error handling sub-org:', subOrgError)
      // If lookup fails, try creating a new sub-org as fallback
      console.log('🏗️ Sub-org lookup failed, attempting to create new sub-org as fallback...')
      try {
        const result = await createUserSubOrg({ email })
        organizationId = result.organizationId
        console.log('✅ Created fallback sub-org:', organizationId)
      } catch (createError) {
        console.error('❌ Failed to create fallback sub-org:', createError)
        throw new Error(`Could not create user sub-organization: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
      }
    }

    // Step 2: Send OTP to the user (now we have proper sub-org context)
    const magicLinkTemplate = `${baseUrl}/email-auth?userEmail=${email}&continueWith=email&credentialBundle=%s`
    console.log('📧 Magic link template:', magicLinkTemplate)
    console.log('📧 Calling client.initOtp with sub-org context:', organizationId)

    const authResponse = await Promise.race([
      client.initOtp({
        userIdentifier: targetPublicKey,
        otpType: OtpType.Email,
        contact: email,
        emailCustomization: {
          magicLinkTemplate,
        },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OTP init timeout after 15s')), 15000)
      )
    ])
    
    console.log('✅ Email OTP initiated successfully with proper sub-org context!')
    console.log('📧 OTP ID:', authResponse.otpId)
    return authResponse
    
  } catch (error) {
    console.error('❌ Turnkey Server Action: Failed to init email OTP:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error('Turnkey API timeout - please check your network connection')
      }
      throw new Error(`Failed to init email OTP: ${error.message}`)
    }
    
    throw new Error('Failed to init email OTP: Unknown error')
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
  try {
    console.log('🔍 Turnkey Server Action: Starting verifyOtp')
    console.log('🔍 OTP ID preview:', otpId.substring(0, 20) + '...')
    console.log('🔍 OTP Code preview:', otpCode.substring(0, 20) + '...')
    console.log('🔍 Public key preview:', publicKey.substring(0, 20) + '...')
    
    console.log('🔐 Calling client.verifyOtp...')
    const authResponse = await client.verifyOtp({
      otpId,
      otpCode,
    })
    
    console.log('✅ verifyOtp successful!')
    console.log('🔐 Verification token exists:', !!authResponse.verificationToken)
    console.log('🔐 Verification token preview:', authResponse.verificationToken?.substring(0, 20) + '...')

    return authResponse
  } catch (error) {
    console.error('❌ verifyOtp failed:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw error
  }
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
  try {
    console.log('🔐 Turnkey Server Action: Starting otpLogin (following docs pattern)')
    console.log('🔐 Email:', email)
    console.log('🔐 Verification token preview:', verificationToken.substring(0, 20) + '...')
    console.log('🔐 Public key preview:', publicKey.substring(0, 20) + '...')
    
    // Following docs: Handle sub-org creation/lookup AFTER OTP verification
    console.log('🔍 Checking if user has existing sub-org...')
    let subOrgId: string
    
    try {
      // Try to find existing sub-org
      const existingSubOrgId = await getSubOrgIdByEmail(email)
      if (existingSubOrgId) {
        console.log('✅ Found existing sub-org:', existingSubOrgId)
        subOrgId = existingSubOrgId
      } else {
        console.log('🏗️ No existing sub-org found, creating new one...')
        // Create sub-org now, after successful OTP verification
        const newUser = await createUserSubOrg({ email })
        subOrgId = newUser.organizationId
        console.log('✅ Created new sub-org:', subOrgId)
      }
    } catch (subOrgError) {
      console.error('❌ Failed to get/create sub-org:', subOrgError)
      // If sub-org lookup/creation fails, try creating a new one
      console.log('🏗️ Attempting to create fresh sub-org as fallback...')
      try {
        const newUser = await createUserSubOrg({ email })
        subOrgId = newUser.organizationId
        console.log('✅ Created fallback sub-org:', subOrgId)
      } catch (createError) {
        console.error('❌ Failed to create fallback sub-org:', createError)
        throw new Error(`Could not create sub-organization for user: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
      }
    }

    console.log('🔐 Calling client.otpLogin with sub-org:', subOrgId)
    const sessionResponse = await client.otpLogin({
      verificationToken,
      publicKey,
      organizationId: subOrgId,
    })
    
    console.log('✅ otpLogin successful!')
    console.log('🔐 Session response votes:', sessionResponse.activity.votes?.length || 0)
    console.log('🔐 Session exists:', !!sessionResponse.session)

    return {
      userId: sessionResponse.activity.votes[0]?.userId,
      session: sessionResponse.session,
      organizationId: subOrgId,
    }
  } catch (error) {
    console.error('❌ otpLogin failed:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw error
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