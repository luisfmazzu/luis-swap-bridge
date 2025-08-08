'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAuth } from './auth-provider'
import { Address } from 'viem'
import { UserSession } from '@/types/turnkey'
import { 
  getValidatedSession, 
  setSessionInStorage, 
  removeSessionFromStorage,
  validateStorageHealth,
  emergencyStorageReset,
  migrateStorage
} from '@/lib/storage'

// Unified wallet state interface
interface UnifiedWalletState {
  // Connection status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' | 'initializing'
  activeConnectionType: 'wagmi' | 'turnkey' | null
  lastUpdate: number
  
  // Wagmi state (from hooks)
  wagmiAddress?: Address
  wagmiChainId?: number
  wagmiIsConnected: boolean
  wagmiIsConnecting: boolean
  
  // Turnkey state (from auth)
  turnkeyUser?: UserSession
  turnkeyAddress?: Address
  
  // Derived primary state (single source of truth)
  primaryAddress?: Address
  primaryConnectionType?: 'wagmi' | 'turnkey'
  
  // Session restoration state
  isSessionRestored: boolean
  storageHealthy: boolean
  
  // Initialization tracking for sequential startup
  initializationSteps: {
    storageChecked: boolean
    sessionRestored: boolean
    authProviderReady: boolean
    wagmiSynced: boolean
  }
  
  // Error state
  error?: string
}

// Action types for state updates
type UnifiedWalletAction =
  | {
      type: 'SYNC_WAGMI_STATE'
      address?: Address
      chainId?: number
      isConnected: boolean
      isConnecting: boolean
    }
  | {
      type: 'SYNC_TURNKEY_STATE'
      user?: UserSession
    }
  | {
      type: 'RESTORE_SESSION'
      user?: UserSession
      storageHealthy: boolean
    }
  | {
      type: 'SESSION_RESTORED'
    }
  | {
      type: 'SET_ERROR'
      error: string
    }
  | {
      type: 'CLEAR_ERROR'
    }
  | {
      type: 'SET_CONNECTING'
      connectionType: 'wagmi' | 'turnkey'
    }
  | {
      type: 'RESET_TO_DISCONNECTED'
    }
  | {
      type: 'MARK_INIT_STEP_COMPLETE'
      step: 'storageChecked' | 'sessionRestored' | 'authProviderReady' | 'wagmiSynced'
    }

// Initial state
const initialState: UnifiedWalletState = {
  connectionStatus: 'initializing',
  activeConnectionType: null,
  lastUpdate: Date.now(),
  wagmiIsConnected: false,
  wagmiIsConnecting: false,
  isSessionRestored: false,
  storageHealthy: false,
  initializationSteps: {
    storageChecked: false,
    sessionRestored: false,
    authProviderReady: false,
    wagmiSynced: false,
  },
}

// State reducer with guaranteed atomic transitions
function unifiedWalletReducer(
  state: UnifiedWalletState,
  action: UnifiedWalletAction
): UnifiedWalletState {
  const timestamp = Date.now()
  
  switch (action.type) {
    case 'SYNC_WAGMI_STATE': {
      const newState = {
        ...state,
        wagmiAddress: action.address,
        wagmiChainId: action.chainId,
        wagmiIsConnected: action.isConnected,
        wagmiIsConnecting: action.isConnecting,
        lastUpdate: timestamp,
      }
      
      // Derive primary connection state
      // Priority: If Turnkey user exists and has addresses, prefer Turnkey
      // Otherwise, use wagmi if connected
      const hasTurnkeyConnection = !!(state.turnkeyUser?.addresses?.[0])
      
      if (hasTurnkeyConnection) {
        // Turnkey takes precedence
        newState.primaryAddress = state.turnkeyUser!.addresses![0] as Address
        newState.primaryConnectionType = 'turnkey'
        newState.activeConnectionType = 'turnkey'
        newState.connectionStatus = 'connected'
      } else if (action.isConnecting) {
        newState.connectionStatus = 'connecting'
        newState.activeConnectionType = 'wagmi'
      } else if (action.isConnected && action.address) {
        // Wagmi connection
        newState.primaryAddress = action.address
        newState.primaryConnectionType = 'wagmi'
        newState.activeConnectionType = 'wagmi'
        newState.connectionStatus = 'connected'
      } else {
        // No connection
        newState.primaryAddress = undefined
        newState.primaryConnectionType = undefined
        newState.activeConnectionType = null
        newState.connectionStatus = 'disconnected'
      }
      
      return newState
    }
    
    case 'SYNC_TURNKEY_STATE': {
      const newState = {
        ...state,
        turnkeyUser: action.user,
        turnkeyAddress: action.user?.addresses?.[0] as Address | undefined,
        lastUpdate: timestamp,
      }
      
      // Store session in validated storage when user exists
      if (action.user) {
        setSessionInStorage(action.user)
      } else {
        removeSessionFromStorage()
      }
      
      // Derive primary connection state
      // Turnkey takes precedence when available
      if (action.user?.addresses?.[0]) {
        newState.primaryAddress = action.user.addresses[0] as Address
        newState.primaryConnectionType = 'turnkey'
        newState.activeConnectionType = 'turnkey'
        newState.connectionStatus = 'connected'
      } else if (state.wagmiIsConnected && state.wagmiAddress) {
        // Fall back to wagmi if available
        newState.primaryAddress = state.wagmiAddress
        newState.primaryConnectionType = 'wagmi'
        newState.activeConnectionType = 'wagmi'
        newState.connectionStatus = 'connected'
      } else {
        // No connection
        newState.primaryAddress = undefined
        newState.primaryConnectionType = undefined
        newState.activeConnectionType = null
        newState.connectionStatus = state.wagmiIsConnecting ? 'connecting' : 'disconnected'
      }
      
      return newState
    }
    
    case 'RESTORE_SESSION': {
      const newState = {
        ...state,
        storageHealthy: action.storageHealthy,
        lastUpdate: timestamp,
      }
      
      if (action.user?.addresses?.[0]) {
        // Restore Turnkey session
        newState.turnkeyUser = action.user
        newState.turnkeyAddress = action.user.addresses[0] as Address
        newState.primaryAddress = action.user.addresses[0] as Address
        newState.primaryConnectionType = 'turnkey'
        newState.activeConnectionType = 'turnkey'
        newState.connectionStatus = 'connected'
      } else {
        // No valid session to restore
        newState.connectionStatus = 'disconnected'
      }
      
      return newState
    }
    
    case 'SESSION_RESTORED': {
      return {
        ...state,
        isSessionRestored: true,
        connectionStatus: state.primaryAddress ? 'connected' : 'disconnected',
        lastUpdate: timestamp,
      }
    }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        connectionStatus: 'error',
        lastUpdate: timestamp,
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined,
        connectionStatus: state.primaryAddress ? 'connected' : 'disconnected',
        lastUpdate: timestamp,
      }
    
    case 'SET_CONNECTING':
      return {
        ...state,
        connectionStatus: 'connecting',
        activeConnectionType: action.connectionType,
        lastUpdate: timestamp,
      }
    
    case 'RESET_TO_DISCONNECTED':
      return {
        ...initialState,
        connectionStatus: 'disconnected',
        isSessionRestored: true,
        storageHealthy: state.storageHealthy,
        initializationSteps: {
          storageChecked: true,
          sessionRestored: true,
          authProviderReady: true,
          wagmiSynced: true,
        },
        lastUpdate: timestamp,
      }
    
    case 'MARK_INIT_STEP_COMPLETE': {
      const newSteps = {
        ...state.initializationSteps,
        [action.step]: true,
      }
      
      // Check if initialization is complete
      const allStepsComplete = Object.values(newSteps).every(step => step)
      const newConnectionStatus = allStepsComplete 
        ? (state.primaryAddress ? 'connected' : 'disconnected')
        : 'initializing'
      
      return {
        ...state,
        initializationSteps: newSteps,
        connectionStatus: newConnectionStatus,
        lastUpdate: timestamp,
      }
    }
    
    default:
      return state
  }
}

// Context interface
interface UnifiedWalletContextType {
  state: UnifiedWalletState
  // Actions
  connectWagmi: () => void
  disconnectWagmi: () => void
  disconnectAll: () => void
  setError: (error: string) => void
  clearError: () => void
  resetToDisconnected: () => void
  // Storage authority methods
  persistSession: (session: UserSession) => void
  clearSession: () => void
}

// Create context
const UnifiedWalletContext = createContext<UnifiedWalletContextType | undefined>(undefined)

// Provider component
interface UnifiedWalletProviderProps {
  children: ReactNode
}

export function UnifiedWalletProvider({ children }: UnifiedWalletProviderProps) {
  const [state, dispatch] = useReducer(unifiedWalletReducer, initialState)
  
  // Wagmi hooks for actions and state
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // Turnkey auth state
  const { state: authState, injectRestoredSession } = useAuth()
  
  // Store inject function in a ref to prevent useEffect dependencies
  const injectSessionRef = useRef(injectRestoredSession)
  injectSessionRef.current = injectRestoredSession
  
  // Sync wagmi state to unified provider
  useEffect(() => {
    dispatch({
      type: 'SYNC_WAGMI_STATE',
      address: address as Address | undefined,
      chainId,
      isConnected,
      isConnecting,
    })
  }, [address, chainId, isConnected, isConnecting])
  
  // SEQUENTIAL INITIALIZATION - SINGLE AUTHORITY (RUNS ONLY ONCE)
  useEffect(() => {
    // Prevent re-initialization if already initialized
    if (state.isSessionRestored) {
      return
    }
    
    const initializeWalletProvider = () => {
      try {
        // Only log on first run
        if (!sessionStorage.getItem('unified-wallet-init-run')) {
          console.log('🚀 UnifiedWallet: Starting sequential initialization')
        }
        
        // STEP 0: Run storage migration first
        const migrationSuccess = migrateStorage()
        if (!migrationSuccess) {
          console.warn('⚠️ Storage migration had issues, continuing anyway...')
        }
        
        // STEP 1: Check storage health
        const storageHealth = validateStorageHealth()
        
        if (!storageHealth.isHealthy) {
          console.warn('🏥 Storage health issues detected:', storageHealth.issues)
        }
        
        dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'storageChecked' })
        
        // STEP 2: Restore session
        const storedSession = getValidatedSession()
        
        if (storedSession) {
          // INJECT session into AuthProvider (single source of truth) 
          if (!sessionStorage.getItem('unified-wallet-init-run')) {
            console.log('🔄 UnifiedWallet: Injecting restored session to AuthProvider')
          }
          injectSessionRef.current(storedSession)
        }
        
        dispatch({
          type: 'RESTORE_SESSION',
          user: storedSession || undefined,
          storageHealthy: storageHealth.isHealthy,
        })
        
        dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'sessionRestored' })
        dispatch({ type: 'SESSION_RESTORED' })
        
        if (!sessionStorage.getItem('unified-wallet-init-run')) {
          console.log('✅ UnifiedWallet: Sequential initialization completed')
          sessionStorage.setItem('unified-wallet-init-run', 'true')
        }
        
      } catch (error) {
        console.error('❌ Wallet initialization failed:', error)
        
        // If storage is completely broken, use emergency reset
        try {
          emergencyStorageReset()
        } catch (resetError) {
          console.error('Failed emergency storage reset:', resetError)
        }
        
        dispatch({
          type: 'RESTORE_SESSION',
          storageHealthy: false,
        })
        dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'storageChecked' })
        dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'sessionRestored' })
        dispatch({ type: 'SESSION_RESTORED' })
      }
    }
    
    // Run synchronously for predictable initialization
    initializeWalletProvider()
  }, []) // Remove injectRestoredSession dependency to prevent infinite loop
  
  // Sync turnkey state to unified provider
  useEffect(() => {
    // Only sync if we've completed session restoration
    if (!state.isSessionRestored) {
      return
    }
    
    dispatch({
      type: 'SYNC_TURNKEY_STATE',
      user: authState.user || undefined,
    })
    
    // Mark auth provider as ready after first sync
    if (state.initializationSteps.sessionRestored) {
      dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'authProviderReady' })
    }
  }, [authState.user, state.isSessionRestored, state.initializationSteps.sessionRestored])
  
  // Mark wagmi as synced after first sync
  useEffect(() => {
    // Only mark wagmi synced if we've completed session restoration
    if (!state.isSessionRestored) {
      return
    }
    
    dispatch({ type: 'MARK_INIT_STEP_COMPLETE', step: 'wagmiSynced' })
  }, [address, isConnected, isConnecting, chainId, state.isSessionRestored])
  
  // Actions
  const connectWagmi = useCallback(() => {
    dispatch({ type: 'SET_CONNECTING', connectionType: 'wagmi' })
    const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0]
    if (connector) {
      connect({ connector })
    }
  }, [connect, connectors])
  
  const disconnectWagmi = useCallback(() => {
    try {
      disconnect()
    } catch (error) {
      console.error('Failed to disconnect wagmi wallet:', error)
      dispatch({ type: 'SET_ERROR', error: 'Failed to disconnect wallet' })
    }
  }, [disconnect])
  
  const disconnectAll = useCallback(() => {
    disconnect()
    // Clear session storage as the single storage authority
    try {
      removeSessionFromStorage()
      console.log('🗑️ UnifiedWallet: Cleared session storage on disconnect')
    } catch (error) {
      console.error('Failed to clear session storage:', error)
    }
    // Note: Turnkey logout should be handled by auth provider
  }, [disconnect])
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', error })
  }, [])
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])
  
  const resetToDisconnected = useCallback(() => {
    disconnect()
    dispatch({ type: 'RESET_TO_DISCONNECTED' })
    // Clear any stored sessions using storage authority
    try {
      emergencyStorageReset()
      console.log('🔄 UnifiedWallet: Emergency reset completed')
    } catch (error) {
      console.error('Failed emergency reset:', error)
    }
  }, [disconnect])
  
  // Storage authority methods - SINGLE SOURCE OF STORAGE TRUTH
  const persistSession = useCallback((session: UserSession) => {
    try {
      setSessionInStorage(session)
      console.log('💾 UnifiedWallet: Session persisted to storage')
    } catch (error) {
      console.error('Failed to persist session:', error)
      setError('Failed to save session')
    }
  }, [])
  
  const clearSession = useCallback(() => {
    try {
      removeSessionFromStorage()
      console.log('🗑️ UnifiedWallet: Session cleared from storage')
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }, [])
  
  const contextValue: UnifiedWalletContextType = {
    state,
    connectWagmi,
    disconnectWagmi,
    disconnectAll,
    setError,
    clearError,
    resetToDisconnected,
    persistSession,
    clearSession,
  }
  
  return (
    <UnifiedWalletContext.Provider value={contextValue}>
      {children}
    </UnifiedWalletContext.Provider>
  )
}

// Hook for consuming the context
export function useUnifiedWallet() {
  const context = useContext(UnifiedWalletContext)
  if (context === undefined) {
    throw new Error('useUnifiedWallet must be used within a UnifiedWalletProvider')
  }
  return context
}

// Convenience hooks for common use cases
export function useWalletConnection() {
  const { state } = useUnifiedWallet()
  return {
    isConnected: state.connectionStatus === 'connected',
    isConnecting: state.connectionStatus === 'connecting',
    isInitializing: state.connectionStatus === 'initializing',
    isSessionRestored: state.isSessionRestored,
    storageHealthy: state.storageHealthy,
    address: state.primaryAddress,
    connectionType: state.primaryConnectionType,
    chainId: state.wagmiChainId, // For wagmi compatibility
  }
}

export function useWalletActions() {
  const { connectWagmi, disconnectWagmi, disconnectAll } = useUnifiedWallet()
  return {
    connect: connectWagmi,
    disconnect: disconnectWagmi,
    disconnectAll,
  }
}