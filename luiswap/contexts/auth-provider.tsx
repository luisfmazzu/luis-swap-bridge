"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useReducer,
} from "react"
import { useRouter } from "next/navigation"
import { useTurnkey } from "@turnkey/sdk-react"
import { SessionType } from "@turnkey/sdk-browser"
import { uncompressRawPublicKey } from "@turnkey/crypto"
import { toHex } from "viem"
import { createUserSubOrg, initEmailAuth, verifyCredentialBundle, oauth, verifyOtp, otpLogin, getSubOrgIdByEmail } from "@/actions/turnkey"
import { useWalletStore } from "@/lib/stores/wallet-store"
import {
  getOtpIdFromStorage,
  removeOtpIdFromStorage,
  setOtpIdInStorage,
  setSessionInStorage,
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

interface AuthContextType {
  state: AuthState
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
  const { setTurnkeyConnection, disconnectTurnkey } = useWalletStore()

  // IndexedDB waits for auth operations to happen
  // Session management is handled by useUser hook

  const loginWithPasskey = async (email?: Email) => {
    dispatch({ type: "LOADING", payload: true })
    try {
      const subOrgId = await getSubOrgIdByEmail(email as string)

      if (subOrgId?.length) {
        await indexedDbClient?.resetKeyPair()
        const publicKey = await indexedDbClient!.getPublicKey()
        await passkeyClient?.loginWithPasskey({
          sessionType: SessionType.READ_WRITE,
          publicKey,
        })

        // Get wallet information after successful authentication
        let addresses: string[] = []
        let walletId: string | undefined = undefined
        
        try {
          if (indexedDbClient) {
            const { wallets } = await indexedDbClient.getWallets()
            
            if (wallets.length > 0) {
              const wallet = wallets[0]
              walletId = wallet.walletId
              
              const { accounts } = await indexedDbClient.getWalletAccounts({
                walletId: wallet.walletId,
              })
              
              // Filter accounts that belong to this organization
              const userAccounts = accounts.filter((account: any) => account.organizationId === subOrgId)
              addresses = userAccounts.map((account: any) => account.address)
            }
          }
        } catch (walletError) {
          console.warn('⚠️ AuthProvider: Failed to fetch wallet info:', walletError)
          // Continue without addresses - they can be fetched later
        }

        const userSession: UserSession = {
          id: email || 'passkey-user',
          name: email || 'passkey-user',
          email: email || 'passkey-user',
          organization: {
            organizationId: subOrgId,
            organizationName: '',
          },
          walletId,
          addresses,
        }

        dispatch({ type: "PASSKEY", payload: userSession })
        
        // Update wallet store with Turnkey connection
        if (addresses.length > 0) {
          setTurnkeyConnection(addresses[0], 'passkey')
        }

        router.push("/swap")
      } else {
        if (!passkeyClient) {
          throw new Error("Passkey client not initialized")
        }

        // Create passkey credential first
        const { encodedChallenge, attestation } = (await passkeyClient?.createUserPasskey({
          publicKey: {
            user: {
              name: email,
              displayName: email,
            },
          },
        })) || {}

        if (!encodedChallenge || !attestation) {
          throw new Error("Failed to create passkey credential")
        }

        // Create sub-organization with the passkey
        const { subOrg, user } = await createUserSubOrg({
          email: email as string,
          passkey: {
            challenge: encodedChallenge,
            attestation,
          },
        })

        if (subOrg && user) {
          // Create user session
          const userSession: UserSession = {
            id: user.userId,
            name: user.userName,
            email: user.userName,
            organization: {
              organizationId: subOrg.subOrganizationId,
              organizationName: "",
            },
          }

          setSessionInStorage(userSession)
          
          router.push("/swap")
        }
      }
    } catch (error: any) {
      // Catch the user cancel error and force a hard reload to avoid a stalled key
      const message: string = error?.message || ""
      if (message.includes("NotAllowedError")) {
        window.location.reload()
        return
      }
      console.error('❌ AuthProvider: Passkey login failed:', error)
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Passkey login failed" })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const initEmailLogin = async (email: Email) => {
    dispatch({ type: "LOADING", payload: true })

    try {
      // Ensure we have a key pair ready - this is the difference from the demo
      // Demo assumes key pair exists, but we need to ensure it's available
      await indexedDbClient?.resetKeyPair()
      const publicKey = await indexedDbClient?.getPublicKey()
      if (!publicKey) {
        throw new Error("No public key found")
      }

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
      console.error('❌ AuthProvider: initEmailLogin error:', error)
      dispatch({ type: "ERROR", payload: error.message })
    } finally {
      dispatch({ type: "LOADING", payload: false })
    }
  }

  const verifyEmailLogin = async (credentialBundle: string, email: string) => {
    try {
      dispatch({ type: "LOADING", payload: true })
      
      const result = await verifyCredentialBundle(credentialBundle, email)
      
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

      dispatch({ type: "COMPLETE_EMAIL_AUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'email')
      }
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
        // Ensure IndexedDB client is available (should be guaranteed by email-auth page dependency check)
        if (!indexedDbClient) {
          console.error('❌ AuthProvider: IndexedDB client is null during completion')
          throw new Error("IndexedDB client not available")
        }
        
        const publicKeyCompressed = await indexedDbClient.getPublicKey()
        if (!publicKeyCompressed) {
          console.error('❌ AuthProvider: No public key found during email completion')
          throw new Error("No public key found")
        }
        
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

        // Get wallet information to include addresses in user session
        let addresses: string[] = []
        let walletId: string | undefined = undefined
        
        try {
          if (indexedDbClient) {
            const { wallets } = await indexedDbClient.getWallets()
            
            if (wallets.length > 0) {
              const wallet = wallets[0]
              walletId = wallet.walletId
              
              const { accounts } = await indexedDbClient.getWalletAccounts({
                walletId: wallet.walletId,
              })
              
              // Filter accounts that belong to this organization
              const userAccounts = accounts.filter((account: any) => account.organizationId === organizationId)
              addresses = userAccounts.map((account: any) => account.address)
            }
          }
        } catch (walletError) {
          console.warn('⚠️ AuthProvider: Failed to fetch wallet info:', walletError)
          // Continue without addresses - they can be fetched later by the dashboard
        }

        const user: UserSession = {
          id: userId,
          name: userEmail,
          email: userEmail,
          organization: {
            organizationId: organizationId,
            organizationName: "",
          },
          walletId,
          addresses,
        }

        setSessionInStorage(user)

        dispatch({ type: "COMPLETE_EMAIL_AUTH", payload: user })
        
        // Update wallet store with Turnkey connection
        if (user.addresses && user.addresses.length > 0) {
          setTurnkeyConnection(user.addresses[0], 'email')
        }

        router.push("/swap")
      } catch (error: any) {
        console.error("❌ AuthProvider: completeEmailAuth error:", error)
        dispatch({ type: "ERROR", payload: error.message })
      } finally {
        dispatch({ type: "LOADING", payload: false })
      }
    }
  }

  const loginWithGoogle = async (credential: string) => {
    try {
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("google", credential)
      
      const user: UserSession = {
        id: result.user.userId,
        name: result.user.userName,
        email: result.user.userEmail,
        organization: {
          organizationId: result.subOrg.subOrganizationId,
          organizationName: result.subOrg.subOrganizationName,
        },
      }

      dispatch({ type: "OAUTH", payload: user })
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
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("apple", credential)
      
      const user: UserSession = {
        id: result.user.userId,
        name: result.user.userName,
        email: result.user.userEmail,
        organization: {
          organizationId: result.subOrg.subOrganizationId,
          organizationName: result.subOrg.subOrganizationName,
        },
      }

      dispatch({ type: "OAUTH", payload: user })
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
      dispatch({ type: "LOADING", payload: true })
      
      const result = await oauth("facebook", credential)
      
      const user: UserSession = {
        id: result.user.userId,
        name: result.user.userName,
        email: result.user.userEmail,
        organization: {
          organizationId: result.subOrg.subOrganizationId,
          organizationName: result.subOrg.subOrganizationName,
        },
      }

      dispatch({ type: "OAUTH", payload: user })
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
      dispatch({ type: "LOADING", payload: true })
      
      // Check if wallet is available
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another wallet.')
      }
      
      // Request wallet connection
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet')
      }
      
      const address = accounts[0]
      
      // Get the public key from the wallet
      // For Ethereum wallets, we can derive this from a signature
      const message = 'Sign this message to authenticate with Turnkey'
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      })
      
      // Extract public key from signature (this is a simplified approach)
      // In production, you'd use proper cryptographic libraries
      const publicKey = signature.slice(2, 66) // Simplified extraction
      
      const result = await createUserSubOrg({
        wallet: {
          publicKey,
          type: 'ethereum'
        },
        email: `wallet-${address}@turnkey.local` // Generate email for wallet users
      })
      
      const user: UserSession = {
        id: result.user.userId,
        name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
        email: `wallet-${address}@turnkey.local`,
        organization: {
          organizationId: result.subOrg.subOrganizationId,
          organizationName: result.subOrg.subOrganizationName,
        },
      }
      
      dispatch({ type: "WALLET_AUTH", payload: user })
      
      // Update wallet store with Turnkey connection
      if (user.addresses && user.addresses.length > 0) {
        setTurnkeyConnection(user.addresses[0], 'wallet')
      }
      
    } catch (error) {
      console.error('❌ AuthProvider: Wallet login failed:', error)
      if (error instanceof Error) {
        console.error('❌ AuthProvider: Error message:', error.message)
        console.error('❌ AuthProvider: Error stack:', error.stack)
      }
      dispatch({ type: "ERROR", payload: error instanceof Error ? error.message : "Wallet login failed" })
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
        state,
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