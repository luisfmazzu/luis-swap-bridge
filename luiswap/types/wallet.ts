export type WalletType = 'wagmi' | 'turnkey'

export interface WalletConnection {
  type: WalletType
  address: string
  chainId?: number
  isConnected: boolean
  organizationId?: string // For Turnkey
  walletId?: string // For Turnkey
}

export interface WalletState {
  wagmi: {
    address?: string
    chainId?: number
    isConnected: boolean
    isConnecting: boolean
  }
  turnkey: {
    address?: string
    chainId?: number
    isConnected: boolean
    isConnecting: boolean
    organizationId?: string
    walletId?: string
  }
  activeConnection: WalletType | null
}

export interface TurnkeyWalletInfo {
  walletId: string
  walletName: string
  accounts: Array<{
    address: string
    publicKey: string
    path: string
  }>
}

export type WalletError = {
  type: 'connection' | 'authentication' | 'network' | 'unknown'
  message: string
  details?: any
}