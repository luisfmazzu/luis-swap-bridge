"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-provider"
import { useTurnkey } from "@turnkey/sdk-react"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function EmailAuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { completeEmailAuth, loading, error, user } = useAuth()
  const { indexedDbClient } = useTurnkey() // Critical: Wait for IndexedDB client like the demo
  const [isProcessing, setIsProcessing] = useState(false)
  const processedRef = useRef(false)
  
  const rawEmail = searchParams.get("userEmail")
  const userEmail = rawEmail?.includes(" ")
    ? rawEmail.replace(/ /g, "+")
    : rawEmail
  const continueWith = searchParams.get("continueWith")
  const credentialBundle = searchParams.get("credentialBundle")

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current || isProcessing) return
    
    console.log('📧 EmailAuth: Component mounted with params:', { userEmail, continueWith, credentialBundle: credentialBundle?.substring(0, 50) + '...' })
    console.log('📧 EmailAuth: IndexedDB client available:', !!indexedDbClient)
    
    // Wait for IndexedDB client to be available (like demo does)
    if (userEmail && continueWith && credentialBundle && indexedDbClient && !user) {
      console.log('📧 EmailAuth: All parameters present AND IndexedDB client ready, starting verification')
      processedRef.current = true
      setIsProcessing(true)
      
      completeEmailAuth({ userEmail, continueWith, credentialBundle }).then(() => {
        console.log('📧 EmailAuth: Verification successful, redirecting to swap')
        setTimeout(() => router.push('/swap'), 1000) // Small delay to ensure state is updated
      }).catch((error) => {
        console.error('📧 EmailAuth: Verification failed:', error)
        setIsProcessing(false)
        processedRef.current = false // Allow retry
      })
    } else {
      console.log('📧 EmailAuth: Waiting for requirements:', { 
        userEmail: !!userEmail, 
        continueWith: !!continueWith, 
        credentialBundle: !!credentialBundle,
        indexedDbClient: !!indexedDbClient,
        userExists: !!user
      })
    }
  }, [userEmail, continueWith, credentialBundle, indexedDbClient, user, completeEmailAuth, router, isProcessing])

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      console.log('📧 EmailAuth: User authenticated, redirecting to swap')
      router.push('/swap')
    }
  }, [user, loading, router])

  const showLoading = loading || isProcessing || (credentialBundle && !error && !user)
  const showError = error && !loading && !isProcessing

  return (
    <main className="flex w-full flex-col items-center justify-center min-h-screen p-4">
      <Card className="mx-auto h-full w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              L
            </div>
          </div>
          <CardTitle className="flex items-center justify-center text-center">
            {showError ? (
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-base">Authentication Failed</span>
              </div>
            ) : showLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-base">Authenticating...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-base">Success! Redirecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-lg font-medium">
                Confirm your email
              </div>
            )}
          </CardTitle>
          {showError && (
            <CardDescription className="text-center text-red-600">
              {error}
            </CardDescription>
          )}
          {!credentialBundle && !showError && (
            <CardDescription className="text-center">
              Click the link sent to{" "}
              <span className="font-bold">{userEmail}</span> to sign in.
            </CardDescription>
          )}
          {user && (
            <CardDescription className="text-center text-green-600">
              Welcome back! Taking you to your wallet...
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </main>
  )
}

export default function EmailAuth() {
  return (
    <Suspense fallback={
      <div className="flex w-full flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <EmailAuthContent />
    </Suspense>
  )
}