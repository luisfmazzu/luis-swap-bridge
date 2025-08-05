import { Turnkey } from '@turnkey/sdk-browser'
import { createConnector } from 'wagmi'
import { TurnkeyViemAccount, viem } from '@turnkey/viem'

// Turnkey configuration
// Note: These should eventually be moved to server-side configuration for security
const turnkeyConfig = {
  apiBaseUrl: process.env.TURNKEY_API_BASE_URL || process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL || 'https://api.turnkey.com',
  defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID || process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || '',
  rpId: process.env.TURNKEY_RP_ID || process.env.NEXT_PUBLIC_TURNKEY_RP_ID || 'localhost',
  serverSignUrl: process.env.TURNKEY_SERVER_SIGN_URL || process.env.NEXT_PUBLIC_TURNKEY_SERVER_SIGN_URL || '/api/turnkey/sign',
  iframeUrl: process.env.TURNKEY_IFRAME_URL || process.env.NEXT_PUBLIC_TURNKEY_IFRAME_URL || 'https://auth.turnkey.com',
}

// Initialize Turnkey client
export const turnkeyClient = new Turnkey(turnkeyConfig)

// Turnkey wallet connector for Wagmi
export function turnkeyConnector() {
  return createConnector((config) => ({
    id: 'turnkey',
    name: 'Turnkey Wallet',
    type: 'turnkey',
    
    async connect({ chainId } = {}) {
      try {
        // Initialize Turnkey authentication
        const authResponse = await turnkeyClient.auth.init({
          email: '', // Will be provided by user in UI
        })

        if (!authResponse.organizationId) {
          throw new Error('Failed to authenticate with Turnkey')
        }

        // Create or retrieve wallet
        const walletResponse = await turnkeyClient.wallets.list()
        let walletId: string

        if (walletResponse.wallets.length === 0) {
          // Create new wallet if none exists
          const createWalletResponse = await turnkeyClient.wallets.create({
            walletName: `LuiSwap-${Date.now()}`,
            accounts: [
              {
                curve: 'CURVE_SECP256K1',
                pathFormat: 'PATH_FORMAT_BIP32',
                path: "m/44'/60'/0'/0/0", // Ethereum derivation path
                addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
              },
            ],
          })
          walletId = createWalletResponse.walletId
        } else {
          walletId = walletResponse.wallets[0].walletId
        }

        // Get wallet accounts
        const accountsResponse = await turnkeyClient.wallets.getAccounts({
          walletId,
        })

        if (accountsResponse.accounts.length === 0) {
          throw new Error('No accounts found in wallet')
        }

        const account = accountsResponse.accounts[0]
        
        // Create Viem account
        const viemAccount = new TurnkeyViemAccount({
          client: turnkeyClient,
          organizationId: authResponse.organizationId,
          signWith: account.address,
        })

        return {
          accounts: [account.address as `0x${string}`],
          chainId: chainId ?? config.chains[0].id,
          account: viemAccount,
        }
      } catch (error) {
        console.error('Turnkey connection error:', error)
        throw new Error('Failed to connect to Turnkey wallet')
      }
    },

    async disconnect() {
      // Turnkey doesn't require explicit disconnection
      // But we can clear any cached data here
      localStorage.removeItem('turnkey-session')
    },

    async getAccounts() {
      try {
        const walletResponse = await turnkeyClient.wallets.list()
        if (walletResponse.wallets.length === 0) return []

        const accountsResponse = await turnkeyClient.wallets.getAccounts({
          walletId: walletResponse.wallets[0].walletId,
        })

        return accountsResponse.accounts.map(
          (account) => account.address as `0x${string}`
        )
      } catch (error) {
        console.error('Failed to get Turnkey accounts:', error)
        return []
      }
    },

    async getChainId() {
      return config.chains[0].id
    },

    async isAuthorized() {
      try {
        // Check if user has valid Turnkey session
        const walletResponse = await turnkeyClient.wallets.list()
        return walletResponse.wallets.length > 0
      } catch {
        return false
      }
    },

    async switchChain({ chainId }) {
      if (!config.chains.some((chain) => chain.id === chainId)) {
        throw new Error(`Chain ${chainId} not supported`)
      }
      
      return config.chains.find((chain) => chain.id === chainId)!
    },

    onAccountsChanged() {
      // Turnkey doesn't typically change accounts automatically
    },

    onChainChanged() {
      // Handle chain changes if needed
    },

    onConnect() {
      // Handle connection events
    },

    onDisconnect() {
      // Handle disconnection events
    },
  }))
}

// Helper functions for Turnkey integration
export const createTurnkeyWallet = async (email: string) => {
  try {
    const authResponse = await turnkeyClient.auth.init({ email })
    
    if (!authResponse.organizationId) {
      throw new Error('Failed to authenticate')
    }

    const createWalletResponse = await turnkeyClient.wallets.create({
      walletName: `LuiSwap-${Date.now()}`,
      accounts: [
        {
          curve: 'CURVE_SECP256K1',
          pathFormat: 'PATH_FORMAT_BIP32',
          path: "m/44'/60'/0'/0/0",
          addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
        },
      ],
    })

    return {
      walletId: createWalletResponse.walletId,
      organizationId: authResponse.organizationId,
    }
  } catch (error) {
    console.error('Error creating Turnkey wallet:', error)
    throw error
  }
}

export const getTurnkeyWallets = async () => {
  try {
    const response = await turnkeyClient.wallets.list()
    return response.wallets
  } catch (error) {
    console.error('Error fetching Turnkey wallets:', error)
    return []
  }
}

export const signWithTurnkey = async (
  message: string,
  organizationId: string,
  signWith: string
) => {
  try {
    const response = await turnkeyClient.auth.signMessage({
      organizationId,
      signWith,
      message,
    })
    return response.signature
  } catch (error) {
    console.error('Error signing with Turnkey:', error)
    throw error
  }
}

export { turnkeyConfig }