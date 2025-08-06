"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react"
import { useRouter } from "next/navigation"
import { useTurnkey } from "@turnkey/sdk-react"
import { createUserSubOrg, initEmailAuth, verifyCredentialBundle, oauth, verifyOtp, otpLogin } from "@/actions/turnkey"
import { useWalletStore } from "@/lib/stores/wallet-store"
import {
  getOtpIdFromStorage,
  removeOtpIdFromStorage,
  setOtpIdInStorage,
  setSessionInStorage,
  getSessionFromStorage,
  removeSessionFromStorage,
} from "@/lib/storage"
import { Email, UserSession } from "@/types/turnkey"

type AuthActionType =
  | { type: "PASSKEY"; payload: UserSession }
  | { type: "INIT_EMAIL_AUTH" }
  | { type: "COMPLETE_EMAIL_AUTH"; payload: UserSession }
  | { type: "EMAIL_RECOVERY"; payload: UserSession }
  | { type: "WALLET_AUTH"; payload: UserSession }
  | { type: "OAUTH"; payload: UserSession }
  | { type: "LOADING"; payload: boolean }
  | { type: "ERROR"; payload: string }
  | { type: "LOGOUT" }

interface AuthState {
  loading: boolean
  error: string
  user: UserSession | null
}

const initialState: AuthState = {
  loading: false,
  error: "",
  user: null,
}

function authReducer(state: AuthState, action: AuthActionType): AuthState {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: action.payload, error: "" }
    case "ERROR":
      return { ...state, error: action.payload, loading: false }
    case "PASSKEY":
    case "COMPLETE_EMAIL_AUTH":
    case "EMAIL_RECOVERY":
    case "WALLET_AUTH":
    case "OAUTH":
      return { ...state, user: action.payload, loading: false, error: "" }
    case "INIT_EMAIL_AUTH":
      return { ...state, loading: false, error: "" }
    case "LOGOUT":
      return { ...state, user: null, loading: false, error: "" }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  loginWithPasskey: (email?: Email) => Promise<void>
  initEmailLogin: (email: Email) => Promise<void>
  verifyEmailLogin: (credentialBundle: string, email: string) => Promise<void>
  completeEmailAuth: (params: { userEmail: string; continueWith: string; credentialBundle: string }) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  loginWithApple: (credential: string) => Promise<void>
  loginWithFacebook: (credential: string) => Promise<void>
  loginWithWallet: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const { passkeyClient, indexedDbClient, turnkey } = useTurnkey()
  const { setTurnkeyConnection, disconnectWagmi, disconnectTurnkey } = useWalletStore()
  const authProcessingRef = useRef(false)
  const warningTimeoutRef = useRef<NodeJS.Timeout>()

  const SESSION_EXPIRY = "900" // This is in seconds
  const WARNING_BUFFER = 30 // seconds before expiry to show warning

  // Initialize IndexedDB client to ensure key pair is available
  useEffect(() => {
    const initializeIndexedDB = async () => {
      console.log('🔧 AuthProvider: Starting IndexedDB client initialization')
      console.log('🔍 IndexedDB client available:', !!indexedDbClient)
      
      if (!indexedDbClient) {
        console.error('❌ AuthProvider: IndexedDB client is null/undefined')
        console.error('❌ This suggests TurnkeyProvider configuration issue')
        return
      }
      
      try {
        console.log('🔧 AuthProvider: Initializing IndexedDB client')
        
        // Try to get existing public key
        console.log('🔍 AuthProvider: Attempting to get existing public key...')
        let publicKey = await indexedDbClient.getPublicKey()
        
        if (!publicKey) {
          console.log('🔑 AuthProvider: No existing key found, generating new key pair')
          console.log('🔄 AuthProvider: Calling resetKeyPair()...')
          await indexedDbClient.resetKeyPair()
          
          console.log('🔍 AuthProvider: Getting public key after reset...')
          publicKey = await indexedDbClient.getPublicKey()
          
          if (!publicKey) {
            console.error('❌ AuthProvider: CRITICAL - Failed to generate public key even after reset')
            console.error('❌ This indicates a fundamental IndexedDB client configuration issue')
            return
          }
          
          console.log('✅ AuthProvider: New key pair generated successfully')
          console.log('🔑 Public key preview:', publicKey.substring(0, 20) + '...')
        } else {
          console.log('✅ AuthProvider: Existing key pair found')
          console.log('🔑 Public key preview:', publicKey.substring(0, 20) + '...')
        }
        
        console.log('✨ AuthProvider: IndexedDB client initialization completed successfully')
        
      } catch (error) {
        console.error('❌ AuthProvider: Failed to initialize IndexedDB client')
        console.error('❌ Error details:', error)
        console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        
        try {
          console.log('🔄 AuthProvider: Attempting recovery with resetKeyPair...')
          await indexedDbClient.resetKeyPair()
          console.log('✅ AuthProvider: Key pair reset completed after error')
          
          const recoveryKey = await indexedDbClient.getPublicKey()
          if (recoveryKey) {
            console.log('✅ AuthProvider: Recovery successful, key generated:', recoveryKey.substring(0, 20) + '...')
          } else {
            console.error('❌ AuthProvider: Recovery failed - still no public key after reset')
          }
        } catch (resetError) {
          console.error('❌ AuthProvider: Failed to reset key pair during recovery')
          console.error('❌ Reset error:', resetError)
          console.error('❌ Reset error message:', resetError instanceof Error ? resetError.message : 'Unknown reset error')
        }
      }
    }

    // Wait a bit for TurnkeyProvider to fully initialize
    const timeoutId = setTimeout(() => {
      initializeIndexedDB()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [indexedDbClient])

  // Load persisted session on mount
  useEffect(() => {
    const persistedSession = getSessionFromStorage()
    if (persistedSession) {
      console.log('🔄 AuthProvider: Loading persisted session:', persistedSession)
      dispatch({ type: "COMPLETE_EMAIL_AUTH", payload: persistedSession })
      
      // Update wallet store
      if (persistedSession.addresses && persistedSession.addresses.length > 0) {
        setTurnkeyConnection(persistedSession.addresses[0], 'email')
      }
    }
  }, [setTurnkeyConnection])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, [])

  const loginWithPasskey = async (email?: Email) => {
    try {
      console.log('🔐 AuthProvider: Starting passkey login for:', email)
      dispatch({ type: "LOADING", payload: true })
      
      // Ensure we have a fresh key pair for passkey authentication
      await indexedDbClient?.resetKeyPair()
      console.log('🔑 AuthProvider: Key pair reset for passkey login')
      
      if (!passkeyClient) {
        console.error('❌ AuthProvider: Passkey client not initialized')
        throw new Error("Passkey client not initialized")
      }
      console.log('✅ AuthProvider: Passkey client is ready')

      // Create passkey authentication challenge
      console.log('🎯 AuthProvider: Generating WebAuthn challenge')
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const challengeB64 = btoa(String.fromCharCode(...challenge))
      console.log('🎯 AuthProvider: Challenge generated, length:', challenge.length)

      // Create WebAuthn credential
      console.log('🗝️ AuthProvider: Creating WebAuthn credential for:', email)
      
      // For localhost development, don't specify rpId to avoid domain issues
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      
      const rpConfig = isLocalhost 
        ? { name: "Luiswap" }  // Don't set id for localhost
        : { name: "Luiswap", id: process.env.NEXT_PUBLIC_TURNKEY_RP_ID || window.location.hostname }
      
      console.log('🗝️ AuthProvider: Using RP config:', rpConfig)
      console.log('🗝️ AuthProvider: Is localhost:', isLocalhost)
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: rpConfig,
          user: {
            id: new TextEncoder().encode(email + '-' + Date.now()), // Make unique per attempt
            name: email,
            displayName: email,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" }, // RS256 - fallback
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Prefer built-in authenticators
            userVerification: "preferred", // Changed from "required" to "preferred"
            requireResidentKey: false,
          },
          timeout: 120000, // Increased timeout to 2 minutes
          attestation: "none", // Changed from "direct" to "none" for better compatibility
        },
      }) as PublicKeyCredential

      if (!credential) {
        console.error('❌ AuthProvider: Failed to create passkey credential')
        throw new Error("Failed to create passkey credential")
      }
      console.log('✅ AuthProvider: WebAuthn credential created successfully')
      console.log('✅ AuthProvider: Credential ID:', credential.id)
      console.log('✅ AuthProvider: Credential type:', credential.type)
      console.log('✅ AuthProvider: Response type:', credential.response.constructor.name)

      const response = credential.response as AuthenticatorAttestationResponse
      console.log('🔄 AuthProvider: Processing credential response')
      
      const attestation = {
        credentialId: credential.id,
        clientDataJson: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
        transports: (credential.response as any).getTransports?.() || [],
      }
      console.log('✅ AuthProvider: Attestation object created, credential ID:', attestation.credentialId)

      // Create user sub-organization with passkey
      console.log('🏗️ AuthProvider: Creating user sub-organization with passkey for:', email)
      const result = await createUserSubOrg({
        email,
        passkey: {
          challenge: challengeB64,
          attestation,
        },
      })
      console.log('✅ AuthProvider: Sub-organization created:', result)

      const user: UserSession = {
        id: result.userId,
        name: result.username,
        email: result.username,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      console.log('👤 AuthProvider: User session created:', user)

      dispatch({ type: "PASSKEY", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'passkey')
      }
      
      console.log('✅ AuthProvider: Passkey authentication completed successfully')
    } catch (error) {
      console.error('❌ AuthProvider: Passkey login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Passkey login failed" })
    }
  }

  const initEmailLogin = async (email: Email) => {
    dispatch({ type: "LOADING", payload: true })

    try {
      // Ensure we have a valid key pair - generate new one if needed
      let publicKey = await indexedDbClient?.getPublicKey()
      if (!publicKey) {
        console.log('🔑 AuthProvider: No public key found, generating new key pair')
        await indexedDbClient?.resetKeyPair()
        publicKey = await indexedDbClient?.getPublicKey()
        
        if (!publicKey) {
          throw new Error("Failed to generate public key")
        }
      }
      
      console.log('✅ AuthProvider: Using public key for email auth:', publicKey.substring(0, 20) + '...')

      const { uncompressRawPublicKey } = await import('@turnkey/crypto')
      const { toHex } = await import('viem')

      const targetPublicKey = toHex(
        uncompressRawPublicKey(new Uint8Array(Buffer.from(publicKey, "hex")))
      )

      if (!targetPublicKey) {
        throw new Error("No public key found")
      }

      const response = await initEmailAuth({
        email,
        targetPublicKey,
        baseUrl: window.location.origin,
      })

      if (response) {
        // Persist otpId locally so it can be reused after page reloads
        if (response.otpId) {
          setOtpIdInStorage(response.otpId)
        }
        dispatch({ type: "INIT_EMAIL_AUTH" })
        router.push(`/email-auth?userEmail=${encodeURIComponent(email)}`)
      }
    } catch (error: any) {
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const verifyEmailLogin = async (credentialBundle: string, email: string) => {
    try {
      console.log('🔐 AuthProvider: Verifying email login with credential bundle for:', email)
      console.log('🔐 AuthProvider: Bundle preview:', credentialBundle.substring(0, 100) + '...')
      dispatch({ type: "LOADING", payload: true })
      
      const result = await verifyCredentialBundle(credentialBundle, email)
      console.log('✅ AuthProvider: Credential bundle verification result:', result)
      
      const user: UserSession = {
        id: result.userId,
        name: result.username,
        email: result.username,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      console.log('👤 AuthProvider: Email user session created:', user)

      dispatch({ type: "COMPLETE_EMAIL_AUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'email')
      }
      
      console.log('✅ AuthProvider: Email authentication completed successfully')
    } catch (error) {
      console.error('❌ AuthProvider: Email verification failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Email verification failed" })
    }
  }

  const completeEmailAuth = async ({
    userEmail,
    continueWith,
    credentialBundle,
  }: {
    userEmail: string
    continueWith: string
    credentialBundle: string
  }) => {
    // validate inputs and begin auth flow

    if (userEmail && continueWith === "email" && credentialBundle) {
      dispatch({ type: "LOADING", payload: true })

      try {
        console.log('🔍 AuthProvider: Starting email completion key validation')
        console.log('🔍 IndexedDB client available:', !!indexedDbClient)
        
        if (!indexedDbClient) {
          console.error('❌ AuthProvider: CRITICAL - IndexedDB client is null during email completion')
          console.error('❌ This should not happen if TurnkeyProvider is properly initialized')
          throw new Error("IndexedDB client not available for email completion")
        }
        
        // Ensure we have a valid key pair for email completion
        console.log('🔍 AuthProvider: Attempting to get public key for email completion...')
        let publicKeyCompressed = await indexedDbClient.getPublicKey()
        
        if (!publicKeyCompressed) {
          console.log('🔑 AuthProvider: No public key found during completion, generating new key pair')
          console.log('🔄 AuthProvider: Calling resetKeyPair() during email completion...')
          
          try {
            await indexedDbClient.resetKeyPair()
            console.log('✅ AuthProvider: resetKeyPair() completed during email completion')
            
            publicKeyCompressed = await indexedDbClient.getPublicKey()
            
            if (!publicKeyCompressed) {
              console.error('❌ AuthProvider: CRITICAL - getPublicKey() returned null after resetKeyPair()')
              console.error('❌ IndexedDB client configuration or environment issue detected')
              throw new Error("Failed to generate public key for email completion - IndexedDB client malfunction")
            }
            
            console.log('✅ AuthProvider: Successfully generated new key pair during email completion')
          } catch (resetError) {
            console.error('❌ AuthProvider: resetKeyPair() failed during email completion')
            console.error('❌ Reset error:', resetError)
            console.error('❌ Reset error message:', resetError instanceof Error ? resetError.message : 'Unknown error')
            throw new Error(`Failed to reset key pair during email completion: ${resetError instanceof Error ? resetError.message : 'Unknown error'}`)
          }
        }
        
        console.log('✅ AuthProvider: Using public key for email completion')
        console.log('🔑 Public key preview:', publicKeyCompressed.substring(0, 20) + '...')
        // We keep the compressed key form for downstream calls

        // Retrieve persisted otpId
        const storedOtpId = getOtpIdFromStorage()

        if (!storedOtpId) {
          throw new Error("OTP identifier not found. Please restart sign-in.")
        }
        const authResponse = await verifyOtp({
          otpId: storedOtpId,
          publicKey: publicKeyCompressed,
          otpCode: credentialBundle,
        })

        const { session, userId, organizationId } = await otpLogin({
          email: userEmail as Email,
          publicKey: publicKeyCompressed,
          verificationToken: authResponse.verificationToken,
        })

        await indexedDbClient?.loginWithSession(session || "")

        // Clear persisted otpId after successful login
        removeOtpIdFromStorage()

        // Schedule warning for session expiry
        const expiryTime = Date.now() + parseInt(SESSION_EXPIRY) * 1000
        scheduleSessionWarning(expiryTime)

        const user: UserSession = {
          id: userId,
          name: userEmail,
          email: userEmail,
          organization: {
            organizationId: organizationId,
            organizationName: "",
          },
        }

        setSessionInStorage(user)

        dispatch({ type: "COMPLETE_EMAIL_AUTH", payload: user })
        
        // Update wallet store with Turnkey connection
        if (user.addresses && user.addresses.length > 0) {
          setTurnkeyConnection(user.addresses[0], 'email')
        }

        router.push("/swap")
      } catch (error: any) {
        console.error("[completeEmailAuth] Error:", error)
        dispatch({ type: "ERROR", payload: error.message })
      } finally {
        dispatch({ type: "LOADING", payload: false })
      }
    }
  }

  const loginWithGoogle = async (credential: string) => {
    try {
      console.log('🔵 AuthProvider: Starting Google OAuth login')
      console.log('🔵 AuthProvider: Credential token:', credential.substring(0, 50) + '...')
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("google", credential)
      console.log('✅ AuthProvider: Google OAuth result:', result)
      
      const user: UserSession = {
        id: result.userId,
        name: result.username,
        email: result.username,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      console.log('👤 AuthProvider: Google user session created:', user)

      dispatch({ type: "OAUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'google')
      }
      
      console.log('✅ AuthProvider: Google authentication completed successfully')
    } catch (error) {
      console.error('❌ AuthProvider: Google login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Google login failed" })
    }
  }

  const loginWithApple = async (credential: string) => {
    try {
      console.log('🍎 AuthProvider: Starting Apple OAuth login')
      console.log('🍎 AuthProvider: Credential token:', credential.substring(0, 50) + '...')
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("apple", credential)
      console.log('✅ AuthProvider: Apple OAuth result:', result)
      
      const user: UserSession = {
        id: result.userId,
        name: result.username,
        email: result.username,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      console.log('👤 AuthProvider: Apple user session created:', user)

      dispatch({ type: "OAUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'apple')
      }
      
      console.log('✅ AuthProvider: Apple authentication completed successfully')
    } catch (error) {
      console.error('❌ AuthProvider: Apple login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Apple login failed" })
    }
  }

  const loginWithFacebook = async (credential: string) => {
    try {
      console.log('📘 AuthProvider: Starting Facebook OAuth login')
      console.log('📘 AuthProvider: Credential token:', credential.substring(0, 50) + '...')
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("facebook", credential)
      console.log('✅ AuthProvider: Facebook OAuth result:', result)
      
      const user: UserSession = {
        id: result.userId,
        name: result.username,
        email: result.username,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      console.log('👤 AuthProvider: Facebook user session created:', user)

      dispatch({ type: "OAUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'facebook')
      }
      
      console.log('✅ AuthProvider: Facebook authentication completed successfully')
    } catch (error) {
      console.error('❌ AuthProvider: Facebook login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Facebook login failed" })
    }
  }

  const loginWithWallet = async () => {
    try {
      console.log('💼 AuthProvider: Starting real wallet import authentication')
      dispatch({ type: "LOADING", payload: true })
      
      // Check if wallet is available
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another wallet.')
      }
      
      // Request wallet connection
      console.log('💼 AuthProvider: Requesting wallet connection')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet')
      }
      
      const address = accounts[0]
      console.log('💼 AuthProvider: Connected to wallet address:', address)
      
      // Get the public key from the wallet
      // For Ethereum wallets, we can derive this from a signature
      const message = 'Sign this message to authenticate with Turnkey'
      console.log('💼 AuthProvider: Requesting signature for authentication')
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      })
      
      console.log('💼 AuthProvider: Signature received')
      
      // Extract public key from signature (this is a simplified approach)
      // In production, you'd use proper cryptographic libraries
      const publicKey = signature.slice(2, 66) // Simplified extraction
      
      console.log('💼 AuthProvider: Creating sub-org with wallet auth')
      const result = await createUserSubOrg({
        wallet: {
          publicKey,
          type: 'ethereum'
        },
        email: `wallet-${address}@turnkey.local` // Generate email for wallet users
      })
      
      const user: UserSession = {
        id: result.userId,
        name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
        email: `wallet-${address}@turnkey.local`,
        organization: {
          organizationId: result.organizationId,
          organizationName: result.organizationName,
        },
        walletId: result.walletId,
        addresses: result.addresses,
      }
      
      console.log('👤 AuthProvider: Wallet user session created:', user)
      dispatch({ type: "WALLET_AUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'wallet')
      }
      
      console.log('✅ AuthProvider: Wallet authentication completed successfully')
      
    } catch (error) {
      console.error('❌ AuthProvider: Wallet login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Wallet login failed" })
    }
  }

  const scheduleSessionWarning = (expiryTime: number) => {
    // Clear any existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    const warningTime = expiryTime - WARNING_BUFFER * 1000
    const now = Date.now()
    const timeUntilWarning = warningTime - now

    if (timeUntilWarning > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        // dispatch({ type: "SESSION_EXPIRING", payload: true })

        // Reset the warning after session actually expires
        const resetTimeout = setTimeout(() => {
          // dispatch({ type: "SESSION_EXPIRING", payload: false })
        }, WARNING_BUFFER * 1000)

        // Clean up reset timeout on unmount
        return () => clearTimeout(resetTimeout)
      }, timeUntilWarning)
    }
  }

  const logout = async () => {
    await turnkey?.logout()
    await indexedDbClient?.clear()
    
    // Clear wallet store
    disconnectTurnkey()
    
    // Clear local storage
    removeSessionFromStorage()
    removeOtpIdFromStorage()
    
    dispatch({ type: "LOGOUT" })
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginWithPasskey,
        initEmailLogin,
        verifyEmailLogin,
        completeEmailAuth,
        loginWithGoogle,
        loginWithApple,
        loginWithFacebook,
        loginWithWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export type { UserSession }