'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-provider'

export function OAuthHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithGoogle, loading, error } = useAuth()

  useEffect(() => {
    const handleOAuth = async () => {
      const googleIdToken = searchParams?.get('google_id_token')
      const oauthProvider = searchParams?.get('oauth_provider')

      if (googleIdToken && oauthProvider === 'google') {
        console.log('🔵 OAuthHandler: Processing Google OAuth callback with ID token')
        
        try {
          // Clean the URL parameters first
          const url = new URL(window.location.href)
          url.searchParams.delete('google_id_token')
          url.searchParams.delete('oauth_provider')
          window.history.replaceState({}, '', url.toString())

          // Process the Google authentication
          await loginWithGoogle(googleIdToken)
          console.log('✅ OAuthHandler: Google authentication completed')
          
          // Redirect to the app after successful authentication
          router.push('/swap')
        } catch (error) {
          console.error('❌ OAuthHandler: Google authentication failed:', error)
          // Stay on landing page with error state
        }
      }
    }

    // Only run if we have the necessary parameters
    if (searchParams?.get('google_id_token')) {
      handleOAuth()
    }
  }, [searchParams, loginWithGoogle, router])

  // Don't render anything - this is just a handler
  return null
}