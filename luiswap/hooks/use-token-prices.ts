'use client'

import { useEffect, useState } from 'react'
import { getAllTokenPrices, getTokenPrice } from '@/actions/prices'

export interface TokenPrices {
  tron: number
  ethereum: number
  celo: number
}

export function useTokenPrices() {
  const [prices, setPrices] = useState<TokenPrices>({
    tron: 0.34,
    ethereum: 3500,
    celo: 0.5
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tokenPrices = await getAllTokenPrices()
        setPrices(tokenPrices)
        
      } catch (err) {
        console.error('❌ useTokenPrices: Error fetching prices:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch prices')
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()

    // Refresh prices every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getPrice = (token: keyof TokenPrices): number => {
    return prices[token]
  }

  return {
    prices,
    loading,
    error,
    getPrice
  }
}

export function useTokenPrice(token: keyof TokenPrices) {
  const [price, setPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tokenPrice = await getTokenPrice(token)
        setPrice(tokenPrice)
        
      } catch (err) {
        console.error('❌ useTokenPrice: Error fetching price for', token, ':', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch price')
        
        // Set fallback price
        const fallbackPrices = {
          tron: 0.34,
          ethereum: 3500,
          celo: 0.5
        }
        setPrice(fallbackPrices[token])
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()

    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token])

  return {
    price,
    loading,
    error
  }
}