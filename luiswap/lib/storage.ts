import { UserSession } from "@/types/turnkey"

const STORAGE_KEYS = {
  TURNKEY_SESSION: 'turnkey-session',
  OTP_ID: 'turnkey-otp-id',
} as const

// Session storage functions
export function setSessionInStorage(session: UserSession): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TURNKEY_SESSION, JSON.stringify(session))
    }
  } catch (error) {
    console.error('Failed to save session to storage:', error)
  }
}

export function getSessionFromStorage(): UserSession | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.TURNKEY_SESSION)
      return stored ? JSON.parse(stored) : null
    }
  } catch (error) {
    console.error('Failed to load session from storage:', error)
  }
  return null
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

// OTP ID storage functions  
export function setOtpIdInStorage(otpId: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.OTP_ID, otpId)
    }
  } catch (error) {
    console.error('Failed to save OTP ID to storage:', error)
  }
}

export function getOtpIdFromStorage(): string | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.OTP_ID)
    }
  } catch (error) {
    console.error('Failed to load OTP ID from storage:', error)
  }
  return null
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