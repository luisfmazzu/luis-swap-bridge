import { 
  setSessionInStorage, 
  getSessionFromStorage, 
  getValidatedSession,
  validateStorageHealth,
  clearAllStorage
} from '../storage'
import { UserSession } from '@/types/turnkey'

// Mock localStorage for testing
const mockLocalStorage = () => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
}

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage(),
  writable: true
})

describe('Storage utilities', () => {
  beforeEach(() => {
    // Clear storage before each test
    clearAllStorage()
  })

  describe('Session storage', () => {
    const mockSession: UserSession = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      organization: {
        organizationId: 'test-org-id',
        organizationName: 'Test Org'
      },
      walletId: 'test-wallet-id',
      addresses: ['0x1234567890123456789012345678901234567890']
    }

    it('should store and retrieve session correctly', () => {
      setSessionInStorage(mockSession)
      const retrieved = getSessionFromStorage()
      
      expect(retrieved).toEqual(mockSession)
    })

    it('should validate session correctly', () => {
      setSessionInStorage(mockSession)
      const validated = getValidatedSession()
      
      expect(validated).toEqual(mockSession)
    })

    it('should reject invalid session', () => {
      const invalidSession = { ...mockSession, id: '', organization: undefined } as any
      setSessionInStorage(invalidSession)
      
      const validated = getValidatedSession()
      expect(validated).toBeNull()
    })

    it('should handle corrupted storage', () => {
      // Manually set corrupted data
      localStorage.setItem('turnkey-session', 'invalid-json')
      
      const retrieved = getSessionFromStorage()
      expect(retrieved).toBeNull()
    })
  })

  describe('Storage health', () => {
    it('should report healthy storage', () => {
      const health = validateStorageHealth()
      expect(health.isHealthy).toBe(true)
      expect(health.issues).toHaveLength(0)
    })

    it('should detect session issues', () => {
      // Set invalid session
      const invalidSession = { id: '', organization: {} } as any
      setSessionInStorage(invalidSession)
      
      const health = validateStorageHealth()
      expect(health.isHealthy).toBe(false)
      expect(health.issues.some(issue => issue.includes('Session missing'))).toBe(true)
    })
  })
})