import { type Address } from 'viem'
import { type Token } from '@/lib/constants/tokens'

// Stargate Finance types and interfaces
export interface BridgeRoute {
  fromChainId: number
  toChainId: number
  fromToken: Token
  toToken: Token
  bridgeProvider: string
  estimatedTime: string
  fees: {
    bridgeFee: string
    gasFee: string
    totalFee: string
  }
  minAmount: string
  maxAmount: string
}

export interface BridgeQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  minimumReceived: string
  route: BridgeRoute
  priceImpact: string
  estimatedTime: string
  fees: {
    bridgeFee: string
    gasFee: string
    totalFee: string
  }
}

export interface BridgeTransaction {
  from: Address
  to: Address
  data: `0x${string}`
  value: string
  gas: string
  gasPrice: string
  chainId: number
}

export interface StargateBridgeParams {
  fromChainId: number
  toChainId: number
  fromTokenAddress: Address
  toTokenAddress: Address
  amount: string
  fromAddress: Address
  toAddress: Address
  slippage?: number
}

// Stargate chain mappings
export const STARGATE_CHAIN_IDS = {
  1: 101,    // Ethereum
  137: 109,  // Polygon
  56: 102,   // BSC
  42161: 110, // Arbitrum
  10: 111,   // Optimism
  43114: 106, // Avalanche
} as const

// Stargate pool mappings for USDC/USDT
export const STARGATE_POOLS = {
  USDC: {
    1: 1,     // Ethereum USDC
    137: 1,   // Polygon USDC
    56: 5,    // BSC USDC
    42161: 1, // Arbitrum USDC
    10: 1,    // Optimism USDC
    43114: 1, // Avalanche USDC
  },
  USDT: {
    1: 2,     // Ethereum USDT
    137: 2,   // Polygon USDT
    56: 2,    // BSC USDT
    42161: 2, // Arbitrum USDT
    10: 2,    // Optimism USDT
    43114: 2, // Avalanche USDT
  },
} as const

// Bridge aggregator class
export class BridgeAggregator {
  private readonly stargateRouterAddress = '0x8731d54E9D02c286767d56ac03e8037C07e01e98'

  // Get available bridge routes
  async getRoutes(
    fromChainId: number,
    toChainId: number,
    tokenSymbol: string
  ): Promise<BridgeRoute[]> {
    // In production, this would query multiple bridge providers
    // For now, we'll simulate Stargate routes
    
    if (!this.isChainSupported(fromChainId) || !this.isChainSupported(toChainId)) {
      throw new Error('Chain not supported for bridging')
    }

    if (!this.isTokenSupported(tokenSymbol)) {
      throw new Error('Token not supported for bridging')
    }

    const route: BridgeRoute = {
      fromChainId,
      toChainId,
      fromToken: this.getTokenByChainAndSymbol(fromChainId, tokenSymbol),
      toToken: this.getTokenByChainAndSymbol(toChainId, tokenSymbol),
      bridgeProvider: 'Stargate',
      estimatedTime: this.getEstimatedTime(fromChainId, toChainId),
      fees: {
        bridgeFee: '0.006', // 0.6% typical bridge fee
        gasFee: '0.001',    // Estimated gas fee
        totalFee: '0.007',
      },
      minAmount: '1',
      maxAmount: '1000000',
    }

    return [route]
  }

  // Get bridge quote
  async getQuote({
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage = 1,
  }: {
    fromChainId: number
    toChainId: number
    fromTokenAddress: Address
    toTokenAddress: Address
    amount: string
    slippage?: number
  }): Promise<BridgeQuote> {
    const routes = await this.getRoutes(fromChainId, toChainId, 'USDC') // Assuming USDC for now
    
    if (routes.length === 0) {
      throw new Error('No bridge routes available')
    }

    const route = routes[0]
    const amountNum = parseFloat(amount)
    const bridgeFeeAmount = amountNum * parseFloat(route.fees.bridgeFee)
    const receivedAmount = amountNum - bridgeFeeAmount
    const slippageAmount = receivedAmount * (slippage / 100)
    const minimumReceived = receivedAmount - slippageAmount

    return {
      fromToken: route.fromToken,
      toToken: route.toToken,
      fromAmount: amount,
      toAmount: receivedAmount.toString(),
      minimumReceived: minimumReceived.toString(),
      route,
      priceImpact: '0.1', // Minimal price impact for stablecoins
      estimatedTime: route.estimatedTime,
      fees: route.fees,
    }
  }

  // Get bridge transaction data
  async getBridgeTransaction({
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    fromAddress,
    toAddress,
    slippage = 1,
  }: StargateBridgeParams): Promise<BridgeTransaction> {
    // In production, this would call Stargate's swap() function
    // For now, return mock transaction data
    
    return {
      from: fromAddress,
      to: this.stargateRouterAddress as Address,
      data: '0x' as `0x${string}`, // Would contain actual Stargate swap calldata
      value: '0',
      gas: '300000',
      gasPrice: '20000000000', // 20 gwei
      chainId: fromChainId,
    }
  }

  // Helper methods
  private isChainSupported(chainId: number): boolean {
    return chainId in STARGATE_CHAIN_IDS
  }

  private isTokenSupported(symbol: string): boolean {
    return symbol in STARGATE_POOLS
  }

  private getTokenByChainAndSymbol(chainId: number, symbol: string): Token {
    // Mock token data - in production, would fetch from constants
    return {
      address: '0xA0b86a33E6441c8C09b53Fba0A14C7cd83C09F56' as Address,
      symbol,
      name: symbol === 'USDC' ? 'USD Coin' : 'Tether USD',
      decimals: 6,
      chainId,
    }
  }

  private getEstimatedTime(fromChainId: number, toChainId: number): string {
    // Estimate based on chain types
    const isL2ToL2 = [137, 42161, 10].includes(fromChainId) && [137, 42161, 10].includes(toChainId)
    const isMainnetInvolved = fromChainId === 1 || toChainId === 1
    
    if (isL2ToL2) return '2-5 minutes'
    if (isMainnetInvolved) return '10-20 minutes'
    return '5-15 minutes'
  }
}

// Create singleton instance
export const bridgeAggregator = new BridgeAggregator()

// Bridge-specific errors
export class BridgeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'BridgeError'
  }
}

export function handleBridgeError(error: any): BridgeError {
  if (error instanceof BridgeError) {
    return error
  }

  if (error.message?.includes('insufficient liquidity')) {
    return new BridgeError('Insufficient bridge liquidity', 'INSUFFICIENT_LIQUIDITY')
  }

  if (error.message?.includes('unsupported chain')) {
    return new BridgeError('Chain not supported for bridging', 'UNSUPPORTED_CHAIN')
  }

  if (error.message?.includes('unsupported token')) {
    return new BridgeError('Token not supported for bridging', 'UNSUPPORTED_TOKEN')
  }

  return new BridgeError(error.message || 'Unknown bridge error', 'UNKNOWN_ERROR', error)
}

// Utility functions
export function calculateBridgeTime(fromChainId: number, toChainId: number): string {
  const aggregator = new BridgeAggregator()
  return aggregator['getEstimatedTime'](fromChainId, toChainId)
}

export function isBridgeSupported(fromChainId: number, toChainId: number): boolean {
  return (fromChainId in STARGATE_CHAIN_IDS) && (toChainId in STARGATE_CHAIN_IDS)
}

export function getSupportedBridgeChains(): number[] {
  return Object.keys(STARGATE_CHAIN_IDS).map(Number)
}