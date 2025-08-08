import { UserSession } from "@/types/turnkey"

const STORAGE_KEYS = {
  TURNKEY_SESSION: 'turnkey-session',
  OTP_ID: 'turnkey-otp-id',
} as const

// Storage version for compatibility checking
const STORAGE_VERSION = '1.0'

// Session expiry time (24 hours)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000

interface StorageEntry<T> {
  version: string
  timestamp: number
  checksum: string
  data: T
}

// Simple checksum generation for integrity validation
function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort())
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
}

// Validate checksum for integrity
function validateChecksum(entry: StorageEntry<any>): boolean {
  const expectedChecksum = generateChecksum(entry.data)
  return entry.checksum === expectedChecksum
}

// Check if entry has expired
function isExpired(timestamp: number, expiryMs: number = SESSION_EXPIRY_MS): boolean {
  return Date.now() - timestamp > expiryMs
}

// Check version compatibility
function isCompatibleVersion(version: string): boolean {
  return version === STORAGE_VERSION
}

// Generic function to set validated storage entry
function setStorageEntry<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      const entry: StorageEntry<T> = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        checksum: generateChecksum(data),
        data
      }
      localStorage.setItem(key, JSON.stringify(entry))
    }
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error)
  }
}

// Generic function to get validated storage entry
function getStorageEntry<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      if (!stored) return null
      
      const entry: StorageEntry<T> = JSON.parse(stored)
      
      // Version compatibility check
      if (!isCompatibleVersion(entry.version)) {
        console.warn(`Storage entry ${key} has incompatible version ${entry.version}, expected ${STORAGE_VERSION}`)
        localStorage.removeItem(key)
        return null
      }
      
      // Integrity validation
      if (!validateChecksum(entry)) {
        console.warn(`Storage entry ${key} failed integrity check`)
        localStorage.removeItem(key)
        return null
      }
      
      // Expiry check
      if (isExpired(entry.timestamp)) {
        console.warn(`Storage entry ${key} has expired`)
        localStorage.removeItem(key)
        return null
      }
      
      return entry.data
    }
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
    // Remove corrupted entry
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
  return null
}

// Enhanced session storage functions
export function setSessionInStorage(session: UserSession): void {
  setStorageEntry(STORAGE_KEYS.TURNKEY_SESSION, session)
}

export function getSessionFromStorage(): UserSession | null {
  return getStorageEntry<UserSession>(STORAGE_KEYS.TURNKEY_SESSION)
}

export function removeSessionFromStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TURNKEY_SESSION)
    }
  } catch (error) {
    console.error('Failed to remove session from storage:', error)
  }
}

// Validated session getter with additional checks
export function getValidatedSession(): UserSession | null {
  const session = getSessionFromStorage()
  if (!session) return null
  
  // Additional validation for UserSession
  if (!session.id || !session.organization?.organizationId) {
    console.warn('Session is missing required fields')
    removeSessionFromStorage()
    return null
  }
  
  return session
}

// OTP ID storage functions with validation
export function setOtpIdInStorage(otpId: string): void {
  setStorageEntry(STORAGE_KEYS.OTP_ID, otpId)
}

export function getOtpIdFromStorage(): string | null {
  return getStorageEntry<string>(STORAGE_KEYS.OTP_ID)
}

export function removeOtpIdFromStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.OTP_ID)
    }
  } catch (error) {
    console.error('Failed to remove OTP ID from storage:', error)
  }
}

// Storage cleanup utilities
export function clearAllStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}

// Emergency storage recovery - clears all app storage and resets to clean state
export function emergencyStorageReset(): void {
  try {
    if (typeof window !== 'undefined') {
      // Clear all our app keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Also clear any legacy keys that might exist
      const keysToRemove = [
        'wallet-store',
        'turnkey-auth-email',
        // Add other legacy keys if discovered
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      console.log('Emergency storage reset completed')
    }
  } catch (error) {
    console.error('Emergency storage reset failed:', error)
    // If even this fails, we might need to advise user to clear browser data
    console.error('Consider clearing browser data manually if issues persist')
  }
}

// Storage health check
export function validateStorageHealth(): {
  isHealthy: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check if localStorage is available
  try {
    if (typeof window === 'undefined') {
      issues.push('localStorage not available (server-side)')
      return { isHealthy: false, issues }
    }
    
    // Test write/read
    const testKey = 'storage-health-test'
    const testValue = 'test'
    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    if (retrieved !== testValue) {
      issues.push('localStorage read/write test failed')
    }
    
  } catch (error) {
    issues.push(`localStorage access error: ${error}`)
  }
  
  // Check session validity if exists
  const session = getSessionFromStorage()
  if (session) {
    if (!session.id) issues.push('Session missing ID')
    if (!session.organization?.organizationId) issues.push('Session missing organization ID')
  }
  
  return {
    isHealthy: issues.length === 0,
    issues
  }
}

// Storage migration utilities (for future use)
export function migrateStorage(): boolean {
  try {
    // Run migration silently on subsequent runs
    const hasRun = sessionStorage.getItem('storage-migration-run')
    
    if (!hasRun) {
      console.log('🔄 Starting storage migration...')
    }
    
    // Migrate from legacy session storage if needed
    migrateLegacySessionStorage()
    
    // Validate current storage
    const health = validateStorageHealth()
    
    if (!hasRun) {
      if (health.isHealthy) {
        console.log('✅ Storage migration completed successfully')
      } else {
        console.warn('⚠️ Storage migration completed with issues:', health.issues)
      }
      
      // Mark migration as run for this session
      sessionStorage.setItem('storage-migration-run', 'true')
    }
    
    return health.isHealthy
  } catch (error) {
    console.error('❌ Storage migration failed:', error)
    return false
  }
}

// Migrate from potential legacy session storage patterns
function migrateLegacySessionStorage(): void {
  try {
    if (typeof window === 'undefined') return
    
    // Check for old wallet-store patterns
    const oldWalletStore = localStorage.getItem('wallet-store')
    if (oldWalletStore) {
      console.log('🔄 Found legacy wallet-store, cleaning up...')
      localStorage.removeItem('wallet-store')
    }
    
    // Check for raw session storage (without validation wrapper)
    const rawTurnkeySession = localStorage.getItem('turnkey-session')
    if (rawTurnkeySession && !rawTurnkeySession.includes('"version"')) {
      console.log('🔄 Found legacy raw session storage, migrating...')
      
      try {
        const legacySession = JSON.parse(rawTurnkeySession)
        // Re-save with validation wrapper
        setSessionInStorage(legacySession)
        console.log('✅ Legacy session migrated to validated storage')
      } catch (parseError) {
        console.warn('⚠️ Could not parse legacy session, removing:', parseError)
        localStorage.removeItem('turnkey-session')
      }
    }
    
    // Clean up any other legacy keys
    const legacyKeys = [
      'wallet-connection-status',
      'turnkey-auth-state',
      'wagmi-store',
    ]
    
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Removing legacy key: ${key}`)
        localStorage.removeItem(key)
      }
    })
    
  } catch (error) {
    console.error('Failed to migrate legacy storage:', error)
  }
}