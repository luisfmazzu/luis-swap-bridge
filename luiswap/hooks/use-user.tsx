import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTurnkey } from "@turnkey/sdk-react"

import { UserSession } from "@/types/turnkey"

export const useUser = () => {
  const { turnkey, indexedDbClient } = useTurnkey()
  const router = useRouter()
  const [user, setUser] = useState<UserSession | undefined>(undefined)

  useEffect(() => {
    const fetchUser = async () => {
      if (turnkey) {
        try {
          const token = await turnkey.getSession()

          // If session invalid or expired, clear user but don't redirect
          // Let individual pages handle their own authentication requirements
          if (!token || !token.expiry || token.expiry < Date.now()) {
            setUser(undefined)
            return
          }

          // Get the user's details from IndexedDB
          const result = await indexedDbClient?.getUser({
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
                const userAccounts = accounts.filter((account: any) => account.organizationId === token.organizationId)
                addresses = userAccounts.map((account: any) => account.address)
              }
            } catch (walletError) {
              console.warn('Failed to fetch wallet info:', walletError)
            }

            const userSession = {
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
            setUser(userSession)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
    }
    fetchUser()
  }, [turnkey, indexedDbClient, router])

  return { user }
}