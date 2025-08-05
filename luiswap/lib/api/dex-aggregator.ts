import { type Address } from 'viem'
import { type Token } from '@/lib/constants/tokens'

// 1inch API types
export interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  protocols: Protocol[][]
  estimatedGas: string
  priceImpact: string
  slippage: string
  route: RouteStep[]
}

export interface SwapTransaction {
  from: Address
  to: Address
  data: `0x${string}`
  value: string
  gas: string
  gasPrice: string
}

export interface Protocol {
  name: string
  part: number
  fromTokenAddress: Address
  toTokenAddress: Address
}

export interface RouteStep {
  name: string
  part: number
  fromTokenAddress: Address
  toTokenAddress: Address
  subRoutes?: RouteStep[]
}

export interface OneInchToken {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export interface OneInchQuoteResponse {
  fromToken: OneInchToken
  toToken: OneInchToken
  toTokenAmount: string
  fromTokenAmount: string
  protocols: Protocol[][]
  estimatedGas: number
}

export interface OneInchSwapResponse {
  fromToken: OneInchToken
  toToken: OneInchToken
  toTokenAmount: string
  fromTokenAmount: string
  protocols: Protocol[][]
  tx: {
    from: Address
    to: Address
    data: string
    value: string
    gas: number
    gasPrice: string
  }
}

// DEX Aggregator class for 1inch API integration
export class DexAggregator {
  private readonly baseUrl = 'https://api.1inch.dev'
  private readonly apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ONEINCH_API_KEY || process.env.NEXT_PUBLIC_1INCH_API_KEY || ''
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const headers: HeadersInit = {
      'accept': 'application/json',
    }

    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get quote for token swap
  async getQuote({
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage = 1, // 1% default slippage
  }: {
    chainId: number
    fromTokenAddress: Address
    toTokenAddress: Address
    amount: string
    slippage?: number
  }): Promise<OneInchQuoteResponse> {
    const params = {
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
      includeProtocols: 'true',
      includeGas: 'true',
    }

    return this.request<OneInchQuoteResponse>(`/swap/v6.0/${chainId}/quote`, params)
  }

  // Get swap transaction data
  async getSwap({
    chainId,
    fromTokenAddress,
    toTokenAddress,
    amount,
    fromAddress,
    slippage = 1,
    disableEstimate = false,
    allowPartialFill = false,
  }: {
    chainId: number
    fromTokenAddress: Address
    toTokenAddress: Address
    amount: string
    fromAddress: Address
    slippage?: number
    disableEstimate?: boolean
    allowPartialFill?: boolean
  }): Promise<OneInchSwapResponse> {
    const params = {
      src: fromTokenAddress,
      dst: toTokenAddress,
      amount,
      from: fromAddress,
      slippage: slippage.toString(),
      disableEstimate: disableEstimate.toString(),
      allowPartialFill: allowPartialFill.toString(),
    }

    return this.request<OneInchSwapResponse>(`/swap/v6.0/${chainId}/swap`, params)
  }

  // Get supported tokens for a chain
  async getTokens(chainId: number): Promise<Record<string, OneInchToken>> {
    return this.request<Record<string, OneInchToken>>(`/swap/v6.0/${chainId}/tokens`)
  }

  // Check if tokens are supported
  async areTokensSupported(chainId: number, tokenAddresses: Address[]): Promise<boolean> {
    try {
      const tokens = await this.getTokens(chainId)
      return tokenAddresses.every(address => 
        Object.values(tokens).some(token => 
          token.address.toLowerCase() === address.toLowerCase()
        )
      )
    } catch (error) {
      console.error('Error checking token support:', error)
      return false
    }
  }

  // Get health status
  async getHealthStatus(chainId: number): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/healthcheck`)
  }
}

// Create singleton instance
export const dexAggregator = new DexAggregator()

// Utility functions
export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  marketPrice?: string
): string {
  if (!marketPrice) return '0'

  const input = parseFloat(inputAmount)
  const output = parseFloat(outputAmount)
  const market = parseFloat(marketPrice)

  const executionPrice = output / input
  const impact = ((market - executionPrice) / market) * 100

  return Math.abs(impact).toFixed(2)
}

export function formatSlippage(slippage: number): string {
  return `${slippage}%`
}

export function isHighPriceImpact(priceImpact: string): boolean {
  return parseFloat(priceImpact) > 5 // 5% or higher is considered high
}

export function isHighSlippage(slippage: number): boolean {
  return slippage > 3 // 3% or higher is considered high
}

// Error handling
export class DexError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'DexError'
  }
}

export function handleDexError(error: any): DexError {
  if (error instanceof DexError) {
    return error
  }

  // Handle common 1inch errors
  if (error.message?.includes('insufficient liquidity')) {
    return new DexError('Insufficient liquidity for this trade', 'INSUFFICIENT_LIQUIDITY')
  }

  if (error.message?.includes('cannot estimate')) {
    return new DexError('Cannot estimate gas for this transaction', 'GAS_ESTIMATION_FAILED')
  }

  if (error.message?.includes('token not found')) {
    return new DexError('Token not supported on this network', 'TOKEN_NOT_SUPPORTED')
  }

  return new DexError(error.message || 'Unknown DEX error', 'UNKNOWN_ERROR', error)
}