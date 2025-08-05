'use client'

import { ReactNode, useEffect, useState } from 'react'

interface ClientWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Client-only wrapper to prevent SSR issues with Web3 components
 * This ensures components only render on the client side
 */
export function ClientWrapper({ children, fallback = null }: ClientWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}