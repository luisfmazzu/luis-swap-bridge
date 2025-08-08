import { useEffect, useState } from "react"
import { useTurnkey } from "@turnkey/sdk-react"
import { UserSession } from "@/types/turnkey"
import { getValidatedSession, validateStorageHealth } from "@/lib/storage"

export const useUser = () => {
  const { turnkey, indexedDbClient } = useTurnkey()
  const [user, setUser] = useState<UserSession | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      
      try {
        // First, check for validated session from storage
        const storedSession = getValidatedSession()
        if (storedSession) {
          console.log('🔄 useUser: Restored session from validated storage')
          setUser(storedSession)
          setIsLoading(false)
          return
        }

        // Validate storage health
        const storageHealth = validateStorageHealth()
        if (!storageHealth.isHealthy) {
          console.warn('⚠️ useUser: Storage health issues detected:', storageHealth.issues)
        }

        // If no stored session, try to get active session from Turnkey
        if (turnkey && indexedDbClient) {
          try {
            const token = await turnkey.getSession()

            // If session invalid or expired, clear user
            if (!token || !token.expiry || token.expiry < Date.now()) {
              console.log('🔄 useUser: No valid Turnkey session found')
              setUser(undefined)
              setIsLoading(false)
              return
            }

            // Get the user's details from IndexedDB
            const result = await indexedDbClient.getUser({
              organizationId: token.organizationId,
              userId: token.userId,
            })

            const { user } = result || {}

            if (user) {
              // Get wallet information 
              let addresses: string[] = []
              let walletId: string | undefined = undefined
              
              try {
                const { wallets } = await indexedDbClient.getWallets()
                
                if (wallets.length > 0) {
                  const wallet = wallets[0]
                  walletId = wallet.walletId
                  
                  const { accounts } = await indexedDbClient.getWalletAccounts({
                    walletId: wallet.walletId,
                  })
                  
                  // Filter accounts that belong to this organization
                  const userAccounts = accounts.filter((account: any) => 
                    account.organizationId === token.organizationId
                  )
                  addresses = userAccounts.map((account: any) => account.address)
                }
              } catch (walletError) {
                console.warn('⚠️ useUser: Failed to fetch wallet info:', walletError)
              }

              const userSession: UserSession = {
                id: user?.userId || "",
                name: user?.userName || "",
                email: user?.userEmail || "",
                organization: {
                  organizationId: token.organizationId,
                  organizationName: "",
                },
                walletId,
                addresses,
              }
              
              console.log('🔄 useUser: Fetched fresh session from Turnkey')
              setUser(userSession)
            } else {
              console.log('🔄 useUser: No user found in Turnkey session')
              setUser(undefined)
            }
          } catch (error) {
            console.error('❌ useUser: Error fetching from Turnkey:', error)
            setUser(undefined)
          }
        } else {
          console.log('🔄 useUser: Turnkey client not available')
          setUser(undefined)
        }
      } catch (error) {
        console.error('❌ useUser: Error in fetchUser:', error)
        setUser(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [turnkey, indexedDbClient])

  return { 
    user, 
    isLoading,
    // Additional utility
    hasValidSession: !!user && !!user.organization?.organizationId 
  }
}