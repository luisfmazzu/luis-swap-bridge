export type WalletType = 'wagmi' | 'turnkey'

export interface WalletConnection {
  type: WalletType
  address: string
  chainId?: number
  isConnected: boolean
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
    authMethod?: 'passkey' | 'email' | 'google' | 'apple' | 'facebook' | 'wallet'
  }
  activeConnection: WalletType | null
}


export type WalletError = {
  type: 'connection' | 'authentication' | 'network' | 'unknown'
  message: string
  details?: any
}