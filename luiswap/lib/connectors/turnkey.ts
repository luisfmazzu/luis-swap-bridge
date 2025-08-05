import { Turnkey } from '@turnkey/sdk-browser'
import { EthereumWallet } from '@turnkey/wallet-stamper'
import { TurnkeyClient } from '@turnkey/http'
import { WalletStamper } from '@turnkey/wallet-stamper'
import {
  createConnector,
  type CreateConnectorFn,
} from 'wagmi'
import {
  type Address,
  type Chain,
  type Hash,
  type Hex,
  type ProviderConnectInfo,
  type ProviderRpcError,
  type Transport,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  fromHex,
  toHex,
  getAddress,
  hexToString,
  stringToHex,
  isAddress,
} from 'viem'
import { normalize } from 'viem/ens'
import { EventEmitter } from 'eventemitter3'

export interface TurnkeyParameters {
  apiBaseUrl?: string
  organizationId: string
  serverSignUrl?: string
  iframeUrl?: string
  appName?: string
  appUrl?: string
  appIconUrl?: string
  projectId?: string
}

export interface TurnkeyConnectorOptions extends TurnkeyParameters {
  chains: readonly Chain[]
  shimDisconnect?: boolean
}

// Events that Turnkey connector can emit
interface TurnkeyConnectorEvents {
  connect: { accounts: readonly Address[]; chainId: number }
  disconnect: void
  change: { accounts?: Address[]; chainId?: number }
  message: { type: string; data?: unknown }
  error: { error: Error }
}

class TurnkeyProvider extends EventEmitter<TurnkeyConnectorEvents> {
  private turnkey: Turnkey | null = null
  private walletClient: any = null
  private currentAccount: Address | null = null
  private currentChainId: number = 1
  private isConnecting = false
  private isConnected = false

  constructor(private options: TurnkeyConnectorOptions) {
    super()
  }

  async initialize() {
    if (this.turnkey) return

    try {
      this.turnkey = new Turnkey({
        apiBaseUrl: this.options.apiBaseUrl || 'https://api.turnkey.com',
        defaultOrganizationId: this.options.organizationId,
        serverSignUrl: this.options.serverSignUrl,
      })
    } catch (error) {
      console.error('Failed to initialize Turnkey:', error)
      throw error
    }
  }

  async connect(): Promise<{ accounts: Address[]; chainId: number }> {
    if (this.isConnecting) {
      throw new Error('Already connecting')
    }

    if (this.isConnected && this.currentAccount) {
      return {
        accounts: [this.currentAccount],
        chainId: this.currentChainId,
      }
    }

    this.isConnecting = true

    try {
      await this.initialize()

      if (!this.turnkey) {
        throw new Error('Turnkey not initialized')
      }

      // Create wallet client with Ethereum wallet
      const ethereumWallet = new EthereumWallet()
      this.walletClient = this.turnkey.walletClient(ethereumWallet)

      // Try to get existing wallets or create a new one
      const walletsResponse = await this.walletClient.getWallets()
      
      let walletId: string
      let address: Address

      if (walletsResponse.wallets && walletsResponse.wallets.length > 0) {
        // Use first available wallet
        const wallet = walletsResponse.wallets[0]
        walletId = wallet.walletId
        
        // Get wallet accounts
        const accountsResponse = await this.walletClient.getWalletAccounts({
          organizationId: walletsResponse.organizationId || this.options.organizationId,
          walletId,
        })

        if (accountsResponse.accounts && accountsResponse.accounts.length > 0) {
          address = getAddress(accountsResponse.accounts[0].address)
        } else {
          throw new Error('No accounts found in wallet')
        }
      } else {
        // Create a new wallet if none exists
        const createResponse = await this.walletClient.createWallet({
          walletName: `LuiSwap Wallet ${Date.now()}`,
          accounts: [
            {
              curve: 'CURVE_SECP256K1',
              pathFormat: 'PATH_FORMAT_BIP32',
              path: "m/44'/60'/0'/0/0",
              addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
            },
          ],
        })

        walletId = createResponse.walletId
        if (createResponse.addresses && createResponse.addresses.length > 0) {
          address = getAddress(createResponse.addresses[0])
        } else {
          throw new Error('Failed to create wallet address')
        }
      }

      this.currentAccount = address
      this.isConnected = true
      this.isConnecting = false

      const result = {
        accounts: [address],
        chainId: this.currentChainId,
      }

      this.emit('connect', result)
      return result
    } catch (error) {
      this.isConnecting = false
      this.emit('error', { error: error as Error })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    this.currentAccount = null
    this.walletClient = null

    this.emit('disconnect')
  }

  async getAccounts(): Promise<Address[]> {
    if (!this.isConnected || !this.currentAccount) {
      return []
    }
    return [this.currentAccount]
  }

  async getChainId(): Promise<number> {
    return this.currentChainId
  }

  async switchChain(chainId: number): Promise<void> {
    // Find the chain in supported chains
    const chain = this.options.chains.find((c) => c.id === chainId)
    if (!chain) {
      throw new Error(`Chain ${chainId} not supported`)
    }

    this.currentChainId = chainId
    this.emit('change', { chainId })
  }

  async signMessage(message: string): Promise<Hex> {
    if (!this.walletClient || !this.currentAccount) {
      throw new Error('Not connected')
    }

    try {
      // Use Turnkey's signing capability
      const wallet = await this.walletClient.getWalletInterface()
      const signature = await wallet.signMessage(message)
      return signature as Hex
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`)
    }
  }

  async signTransaction(transaction: any): Promise<Hex> {
    if (!this.walletClient || !this.currentAccount) {
      throw new Error('Not connected')
    }

    try {
      // Use Turnkey's transaction signing
      const wallet = await this.walletClient.getWalletInterface()
      const signedTx = await wallet.signTransaction(transaction)
      return signedTx as Hex
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error}`)
    }
  }

  async request({ method, params }: { method: string; params?: unknown[] }): Promise<unknown> {
    switch (method) {
      case 'eth_requestAccounts':
        const { accounts } = await this.connect()
        return accounts

      case 'eth_accounts':
        return await this.getAccounts()

      case 'eth_chainId':
        return toHex(await this.getChainId())

      case 'wallet_switchEthereumChain':
        if (params && Array.isArray(params) && params[0] && typeof params[0] === 'object') {
          const { chainId } = params[0] as { chainId: string }
          await this.switchChain(fromHex(chainId as Hex, 'number'))
          return null
        }
        throw new Error('Invalid parameters for wallet_switchEthereumChain')

      case 'personal_sign':
        if (params && Array.isArray(params) && params.length >= 2) {
          const [message, address] = params as [string, string]
          if (getAddress(address) !== this.currentAccount) {
            throw new Error('Address mismatch')
          }
          return await this.signMessage(message)
        }
        throw new Error('Invalid parameters for personal_sign')

      case 'eth_signTransaction':
        if (params && Array.isArray(params) && params[0]) {
          return await this.signTransaction(params[0])
        }
        throw new Error('Invalid parameters for eth_signTransaction')

      case 'eth_sendTransaction':
        if (params && Array.isArray(params) && params[0]) {
          const signedTx = await this.signTransaction(params[0])
          // Here you would typically broadcast the transaction
          // For now, we'll return the signed transaction hash
          return signedTx
        }
        throw new Error('Invalid parameters for eth_sendTransaction')

      default:
        throw new Error(`Method ${method} not supported`)
    }
  }

  on = super.on.bind(this)
  once = super.once.bind(this)
  off = super.off.bind(this)
  removeListener = super.removeListener.bind(this)
}

turnkey.type = 'turnkey' as const

export function turnkey(parameters: TurnkeyParameters): CreateConnectorFn {
  let provider: TurnkeyProvider | undefined

  return createConnector((config) => ({
    id: 'turnkey',
    name: 'Turnkey',
    type: turnkey.type,
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDAwIiByeD0iMTYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI2IiB5PSI2Ij4KPHBhdGggZD0iTTEwIDJMMTggMTBMMTAgMThMMiAxMEwxMCAyWiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4KPC9zdmc+',

    async setup() {
      provider = new TurnkeyProvider({
        ...parameters,
        chains: config.chains,
      })

      provider.on('connect', ({ accounts, chainId }) => {
        config.emitter.emit('connect', { accounts, chainId })
      })

      provider.on('disconnect', () => {
        config.emitter.emit('disconnect')
      })

      provider.on('change', ({ accounts, chainId }) => {
        if (accounts || chainId) {
          config.emitter.emit('change', { accounts, chainId })
        }
      })
    },

    async connect({ chainId } = {}) {
      if (!provider) throw new Error('Provider not initialized')

      try {
        const { accounts, chainId: providerChainId } = await provider.connect()

        if (chainId && chainId !== providerChainId) {
          await provider.switchChain(chainId)
        }

        return {
          accounts,
          chainId: chainId || providerChainId,
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw new Error('User rejected connection')
          }
          if (error.message.includes('Already connecting')) {
            throw new Error('Already connecting')
          }
        }
        throw error
      }
    },

    async disconnect() {
      if (!provider) return
      await provider.disconnect()
    },

    async getAccounts() {
      if (!provider) return []
      return await provider.getAccounts()
    },

    async getChainId() {
      if (!provider) throw new Error('Provider not initialized')
      return await provider.getChainId()
    },

    async getProvider() {
      if (!provider) throw new Error('Provider not initialized')
      return provider
    },

    async isAuthorized() {
      if (!provider) return false
      const accounts = await provider.getAccounts()
      return accounts.length > 0
    },

    async switchChain({ chainId }) {
      if (!provider) throw new Error('Provider not initialized')

      const chain = config.chains.find((c) => c.id === chainId)
      if (!chain) {
        throw new Error(`Chain ${chainId} not configured`)
      }

      await provider.switchChain(chainId)
      return chain
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect')
      } else {
        config.emitter.emit('change', { accounts: accounts as Address[] })
      }
    },

    onChainChanged(chainId) {
      const id = Number(chainId)
      config.emitter.emit('change', { chainId: id })
    },

    onDisconnect() {
      config.emitter.emit('disconnect')
    },
  }))
}