import { createConnector } from 'wagmi'
import type { CreateConnectorFn } from 'wagmi'

export interface TurnkeyParameters {
  organizationId: string
  apiBaseUrl?: string
  serverSignUrl?: string
  appName?: string
  appUrl?: string
  appIconUrl?: string
}

turnkeySimple.type = 'turnkey' as const

export function turnkeySimple(parameters: TurnkeyParameters): CreateConnectorFn {
  return createConnector((config) => ({
    id: 'turnkey',
    name: 'Turnkey',
    type: turnkeySimple.type,
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDAwIiByeD0iMTYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI2IiB5PSI2Ij4KPHBhdGggZD0iTTEwIDJMMTggMTBMMTAgMThMMiAxMEwxMCAyWiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4KPC9zdmc+',

    async setup() {
      // Basic setup - no complex provider for now
    },

    async connect({ chainId } = {}) {
      try {
        // Check if organization ID is configured
        if (!parameters.organizationId) {
          throw new Error('Turnkey organization ID not configured. Please set NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID environment variable.')
        }
        
        // For now, throw a more informative error about the implementation
        throw new Error('Turnkey connector is not fully implemented yet. This requires Turnkey SDK integration and iframe setup. Please use MetaMask or Coinbase Wallet for now.')
      } catch (error) {
        // Re-throw with more context
        throw error
      }
    },

    async disconnect() {
      // Basic disconnect
    },

    async getAccounts() {
      return []
    },

    async getChainId() {
      return config.chains[0].id
    },

    async getProvider() {
      return null
    },

    async isAuthorized() {
      return false
    },

    async switchChain({ chainId }) {
      const chain = config.chains.find((c) => c.id === chainId)
      if (!chain) {
        throw new Error(`Chain ${chainId} not configured`)
      }
      return chain
    },

    onAccountsChanged() {},
    onChainChanged() {},
    onConnect() {},
    onDisconnect() {},
  }))
}