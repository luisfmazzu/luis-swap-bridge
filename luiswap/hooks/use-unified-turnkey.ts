'use client'

import { useTurnkey } from '@turnkey/sdk-react'
import { useUnifiedWallet } from '@/contexts/unified-wallet-provider'
import { useAuth } from '@/contexts/auth-provider'

/**
 * Unified Turnkey hook that ensures all Turnkey operations flow through unified state
 * This prevents components from bypassing the unified wallet provider
 */
export function useUnifiedTurnkey() {
  const { turnkey, passkeyClient, indexedDbClient } = useTurnkey()
  const { state: unifiedState, setError } = useUnifiedWallet()
  const { state: authState } = useAuth()
  
  // Wrap turnkey methods to ensure state consistency
  const unifiedTurnkey = turnkey ? {
    ...turnkey,
    
    // Override methods that affect state
    getSession: async () => {
      try {
        const session = await turnkey.getSession()
        // Session changes are handled by AuthProvider -> UnifiedWallet flow
        return session
      } catch (error) {
        console.error('🚨 UnifiedTurnkey: getSession error:', error)
        setError(`Session error: ${error}`)
        return null
      }
    },
    
    logout: async () => {
      try {
        // Let AuthProvider handle logout (which will update unified state)
        return await turnkey.logout()
      } catch (error) {
        console.error('🚨 UnifiedTurnkey: logout error:', error)
        setError(`Logout error: ${error}`)
        throw error
      }
    }
  } : null

  return {
    // Provide the wrapped turnkey instance
    turnkey: unifiedTurnkey,
    passkeyClient,
    indexedDbClient,
    
    // Provide unified state information
    isConnected: unifiedState.connectionStatus === 'connected',
    connectionType: unifiedState.primaryConnectionType,
    address: unifiedState.primaryAddress,
    user: authState.user,
    
    // State flags
    isInitializing: unifiedState.connectionStatus === 'initializing',
    isSessionRestored: unifiedState.isSessionRestored,
    storageHealthy: unifiedState.storageHealthy,
  }
}

/**
 * Legacy compatibility hook - redirects to useUnifiedTurnkey
 * This ensures existing components work without modification
 */
export function useTurnkeyCompat() {
  console.warn('⚠️ Using legacy useTurnkey - consider migrating to useUnifiedTurnkey')
  return useUnifiedTurnkey()
}