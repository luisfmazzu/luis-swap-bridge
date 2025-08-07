'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTurnkey } from '@turnkey/sdk-react'
import { useWalletStore } from '@/lib/stores/wallet-store'
import { useAuth } from '@/contexts/auth-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Mail,
  Fingerprint,
  Wallet
} from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface TurnkeyAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (address: string) => void
}

const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailFormData = z.infer<typeof emailFormSchema>

type AuthStep = 'email-form' | 'email-verification' | 'success'

export function TurnkeyAuthModal({ open, onOpenChange, onSuccess }: TurnkeyAuthModalProps) {
  const [step, setStep] = useState<AuthStep>('email-form')
  const [userEmail, setUserEmail] = useState('')
  const [otpId, setOtpId] = useState('')
  const [connectedAddress, setConnectedAddress] = useState('')
  
  const searchParams = useSearchParams()
  const { passkeyClient } = useTurnkey()
  const { setTurnkeyConnection } = useWalletStore()
  const { 
    loginWithPasskey, 
    initEmailLogin, 
    verifyEmailLogin,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    loading,
    error: authError,
    user
  } = useAuth()

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  })

  // Handle successful authentication from AuthProvider
  useEffect(() => {
    console.log('🔄 TurnkeyAuthModal: User state changed:', user)
    if (user && user.addresses && user.addresses[0]) {
      const address = user.addresses[0]
      console.log('✅ TurnkeyAuthModal: Setting Turnkey connection with address:', address)
      setTurnkeyConnection(address, 'passkey', 1) // Default to mainnet
      setConnectedAddress(address)
      setStep('success')
      console.log('🎉 TurnkeyAuthModal: Authentication successful, calling onSuccess')
      onSuccess?.(address)
    }
  }, [user, setTurnkeyConnection, onSuccess])

  // Check for credential bundle in URL params (from email callback)
  useEffect(() => {
    if (open) {
      const credentialBundle = searchParams?.get('credential_bundle')
      if (credentialBundle) {
        console.log('📧 TurnkeyAuthModal: Found credential bundle in URL, processing...')
        // Extract email from URL or localStorage if needed
        const storedEmail = localStorage.getItem('turnkey-auth-email')
        if (storedEmail) {
          setUserEmail(storedEmail)
          handleEmailVerificationSuccess(credentialBundle)
          // Clear the URL parameter
          const url = new URL(window.location.href)
          url.searchParams.delete('credential_bundle')
          window.history.replaceState({}, '', url.toString())
        }
      }
    }
  }, [open, searchParams])

  // Reset state when modal opens/closes
  useEffect(() => {
    console.log('🔄 TurnkeyAuthModal: Modal state changed, open:', open)
    if (open) {
      console.log('🔄 TurnkeyAuthModal: Resetting modal state')
      setStep('email-form')
      setUserEmail('')
      setOtpId('')
      setConnectedAddress('')
      form.reset()
    }
  }, [open, form])

  const handleClose = () => {
    console.log('❌ TurnkeyAuthModal: Closing modal and resetting state')
    setStep('email-form')
    setUserEmail('')
    setOtpId('')
    setConnectedAddress('')
    form.reset()
    onOpenChange(false)
  }

  const handlePasskeyAuth = async (email: string) => {
    console.log('🔐 TurnkeyAuthModal: Starting passkey authentication for:', email)
    setUserEmail(email)
    try {
      await loginWithPasskey(email)
      console.log('✅ TurnkeyAuthModal: Passkey authentication completed successfully')
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Passkey authentication failed:', error)
    }
  }

  const handleEmailAuth = async (email: string) => {
    console.log('📧 TurnkeyAuthModal: Starting real email authentication for:', email)
    setUserEmail(email)
    // Store email for later use when credential bundle returns
    localStorage.setItem('turnkey-auth-email', email)
    try {
      const result = await initEmailLogin(email)
      console.log('✅ TurnkeyAuthModal: Email credential request sent:', result)
      if (!authError) {
        // Real Turnkey implementation - email contains credential bundle link
        setStep('email-verification')
        console.log('📧 TurnkeyAuthModal: Moved to email verification step - user needs to click link in email')
      } else {
        console.error('❌ TurnkeyAuthModal: Email auth failed with error:', authError)
      }
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Email authentication failed:', error)
    }
  }

  const handleWalletAuth = async () => {
    // Note: Wallet import not yet implemented in AuthProvider
    console.log('💼 TurnkeyAuthModal: Wallet authentication not yet fully implemented')
  }

  const handleGoogleAuth = async () => {
    console.log('🔵 TurnkeyAuthModal: Starting real Google OAuth authentication')
    try {
      // Redirect to Google OAuth
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!googleClientId) {
        throw new Error('Google Client ID not configured')
      }
      
      const redirectUri = `${window.location.origin}/auth/oauth/google`
      const scopes = 'openid email profile'
      const state = btoa(JSON.stringify({ provider: 'google', timestamp: Date.now() }))
      
      const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?` +
        `client_id=${encodeURIComponent(googleClientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${encodeURIComponent(state)}`
      
      console.log('🔵 TurnkeyAuthModal: Redirecting to Google OAuth')
      window.location.href = googleAuthUrl
      
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Google authentication failed:', error)
    }
  }

  const handleAppleAuth = async () => {
    console.log('🍎 TurnkeyAuthModal: Starting real Apple Sign In authentication')
    try {
      // Apple Sign In requires different setup - for now, show message
      alert('Apple Sign In requires additional setup. Please use email or Google authentication for now.')
      console.log('⚠️ TurnkeyAuthModal: Apple Sign In requires additional client-side setup')
      
      // TODO: Implement Apple Sign In JavaScript SDK
      // This requires loading AppleID.auth.js and proper configuration
      // See: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js
      
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Apple authentication failed:', error)
    }
  }

  const handleFacebookAuth = async () => {
    console.log('📘 TurnkeyAuthModal: Starting real Facebook Login authentication')
    try {
      // Facebook Login requires Facebook SDK - for now, show message
      alert('Facebook Login requires additional setup. Please use email or Google authentication for now.')
      console.log('⚠️ TurnkeyAuthModal: Facebook Login requires Facebook SDK setup')
      
      // TODO: Implement Facebook Login SDK
      // This requires loading Facebook SDK and proper app configuration
      // See: https://developers.facebook.com/docs/facebook-login/web/
      
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Facebook authentication failed:', error)
    }
  }

  const handleEmailVerificationSuccess = async (credentialBundle: string) => {
    console.log('📧 TurnkeyAuthModal: Processing credential bundle from email for:', userEmail)
    console.log('📧 TurnkeyAuthModal: Bundle preview:', credentialBundle.substring(0, 100) + '...')
    try {
      await verifyEmailLogin(credentialBundle, userEmail)
      console.log('✅ TurnkeyAuthModal: Email verification completed successfully')
    } catch (error) {
      console.error('❌ TurnkeyAuthModal: Email verification failed:', error)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const renderEmailForm = () => (
    <Card className="mx-auto w-full max-w-[450px] border-border bg-background">
      <CardHeader className="space-y-4">
        <div className="relative flex items-center justify-center gap-2">
          <Shield className="h-16 w-16 text-primary" />
          <Badge
            variant="secondary"
            className="absolute -right-1 border-primary bg-primary/10 px-2 py-1 text-xs text-primary"
          >
            Turnkey
          </Badge>
        </div>
        <CardTitle className="text-center text-xl font-medium text-foreground">
          Log in or sign up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              className="w-full font-semibold"
              disabled={!form.formState.isValid || loading}
              onClick={() => handlePasskeyAuth(form.getValues().email)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Continue with passkey
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full font-semibold"
              disabled={!form.formState.isValid || loading}
              onClick={() => handleEmailAuth(form.getValues().email)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with email
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full font-semibold"
              disabled={loading}
              onClick={handleWalletAuth}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Continue with wallet
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={handleGoogleAuth}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Sign in with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={handleAppleAuth}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Sign in with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={handleFacebookAuth}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            Sign in with Facebook
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By connecting, you agree to our{' '}
            <a href="#" className="underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmailVerification = () => (
    <Card className="mx-auto w-full max-w-[450px] border-border bg-background">
      <CardHeader className="space-y-4">
        <div className="relative flex items-center justify-center gap-2">
          <Mail className="h-16 w-16 text-primary" />
        </div>
        <CardTitle className="text-center text-xl font-medium text-foreground">
          Check your email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            We sent a verification link to
          </p>
          <p className="font-medium text-foreground">{userEmail}</p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to continue
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleEmailVerificationSuccess}
          >
            I've verified my email
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep('email-form')}
          >
            Back to sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSuccess = () => (
    <Card className="mx-auto w-full max-w-[450px] border-border bg-background">
      <CardHeader className="space-y-4">
        <div className="relative flex items-center justify-center gap-2">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-center text-xl font-medium text-foreground">
          Connected Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Your Turnkey wallet is ready to use
          </p>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Address:</span>
              <span className="font-mono text-sm text-foreground">
                {formatAddress(connectedAddress)}
              </span>
            </div>
          </div>
        </div>

        <Button onClick={handleClose} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Turnkey Authentication</DialogTitle>
          <DialogDescription>Sign in to your Turnkey wallet</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {step === 'email-form' && renderEmailForm()}
          {step === 'email-verification' && renderEmailVerification()}
          {step === 'success' && renderSuccess()}
        </div>
      </DialogContent>
    </Dialog>
  )
}