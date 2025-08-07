"use server"

// CoinGecko API token IDs for different cryptocurrencies
const COIN_IDS = {
  tron: 'tron',
  ethereum: 'ethereum',
  celo: 'celo'
} as const

type TokenPriceResponse<T extends string> = {
  [key in T]: {
    usd: number
  }
}

export async function getTokenPrice<T extends keyof typeof COIN_IDS>(
  token: T
): Promise<number> {
  const coinId = COIN_IDS[token]
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  
  try {
    console.log('🔍 Fetching price for', token, 'from CoinGecko')
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        // CoinGecko API key is optional for demo usage
        ...(process.env.COINGECKO_API_KEY && {
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
        })
      },
      // Cache for 5 minutes to avoid rate limiting
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} - ${response.statusText}`)
    }

    const data: TokenPriceResponse<typeof coinId> = await response.json()
    const price = data[coinId].usd

    console.log('✅ Fetched price for', token, ':', price, 'USD')
    return price
    
  } catch (error) {
    console.warn('❌ Failed to fetch price for', token, ':', error)
    
    // Return fallback prices if API fails
    const fallbackPrices = {
      tron: 0.34,
      ethereum: 3500,
      celo: 0.5
    }
    
    console.log('🔄 Using fallback price for', token, ':', fallbackPrices[token])
    return fallbackPrices[token]
  }
}

export async function getAllTokenPrices() {
  try {
    console.log('🔍 Fetching all token prices')
    
    // Fetch all prices in parallel
    const [tronPrice, ethPrice, celoPrice] = await Promise.all([
      getTokenPrice('tron'),
      getTokenPrice('ethereum'),
      getTokenPrice('celo')
    ])

    return {
      tron: tronPrice,
      ethereum: ethPrice,
      celo: celoPrice
    }
  } catch (error) {
    console.error('❌ Failed to fetch all token prices:', error)
    
    // Return fallback prices
    return {
      tron: 0.34,
      ethereum: 3500,
      celo: 0.5
    }
  }
}

// New function to fetch prices for multiple tokens by CoinGecko IDs
export async function getTokenPricesByIds(coingeckoIds: string[]): Promise<Record<string, number>> {
  if (coingeckoIds.length === 0) {
    return {}
  }

  try {
    const uniqueIds = [...new Set(coingeckoIds)]
    const idsString = uniqueIds.join(',')
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`
    
    console.log('🔍 Fetching prices for CoinGecko IDs:', uniqueIds)
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        // CoinGecko API key is optional for demo usage
        ...(process.env.COINGECKO_API_KEY && {
          "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
        })
      },
      // Cache for 5 minutes to avoid rate limiting
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    const prices: Record<string, number> = {}
    
    for (const id of uniqueIds) {
      if (data[id] && data[id].usd) {
        prices[id] = data[id].usd
        console.log('✅ Fetched price for', id, ':', data[id].usd, 'USD')
      } else {
        console.warn('⚠️ No price found for', id)
        // Set fallback prices for known tokens
        const fallbackPrices: Record<string, number> = {
          'tron': 0.34,
          'ethereum': 3500,
          'celo': 0.5,
          'tether': 1.0,
          'celo-dollar': 1.0,
          'celo-euro': 1.1
        }
        prices[id] = fallbackPrices[id] || 0
      }
    }
    
    return prices
    
  } catch (error) {
    console.warn('❌ Failed to fetch prices for CoinGecko IDs:', coingeckoIds, error)
    
    // Return fallback prices
    const fallbackPrices: Record<string, number> = {}
    coingeckoIds.forEach(id => {
      const defaults: Record<string, number> = {
        'tron': 0.34,
        'ethereum': 3500,
        'celo': 0.5,
        'tether': 1.0,
        'celo-dollar': 1.0,
        'celo-euro': 1.1
      }
      fallbackPrices[id] = defaults[id] || 0
    })
    
    return fallbackPrices
  }
}