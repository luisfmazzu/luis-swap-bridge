'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Fingerprint, 
  Wallet, 
  Plus, 
  AlertTriangle, 
  Loader2,
  CheckCircle2,
  Mail,
  Chrome 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTurnkey } from '@/hooks/use-turnkey'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

interface TurnkeyAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailFormData = z.infer<typeof emailFormSchema>

export function TurnkeyAuthModal({ open, onOpenChange, onSuccess }: TurnkeyAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [authStep, setAuthStep] = useState<'initial' | 'email-verification'>('initial')
  const [newWalletName, setNewWalletName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  })
  
  const {
    isInitialized,
    isAuthenticating,
    isConnecting,
    isConnected,
    address,
    wallets,
    loginWithPasskey,
    loginWithWallet,
    createWallet,
    switchWallet,
    disconnect,
    formatAddress,
  } = useTurnkey()

  // Clear error when modal opens
  useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address) {
      onSuccess?.()
    }
  }, [isConnected, address, onSuccess])

  const handlePasskeyLogin = async () => {
    try {
      setError(null)
      await loginWithPasskey()
    } catch (err) {
      console.error('Passkey login failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to authenticate with passkey')
    }
  }

  const handleWalletLogin = async () => {
    try {
      setError(null)
      await loginWithWallet()
    } catch (err) {
      console.error('Wallet login failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to authenticate with wallet')
    }
  }

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      setError('Please enter a wallet name')
      return
    }

    try {
      setError(null)
      await createWallet(newWalletName.trim())
      setNewWalletName('')
    } catch (err) {
      console.error('Create wallet failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to create wallet')
    }
  }

  const handleWalletSwitch = async (walletId: string) => {
    try {
      setError(null)
      await switchWallet(walletId)
    } catch (err) {
      console.error('Switch wallet failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch wallet')
    }
  }

  const handleClose = () => {
    setError(null)
    setAuthStep('initial')
    setUserEmail('')
    form.reset()
    onOpenChange(false)
  }

  const handleEmailAuth = async (data: EmailFormData) => {
    try {
      setError(null)
      setUserEmail(data.email)
      // For now, we'll simulate email auth by going directly to passkey
      // In a full implementation, you'd send an email with a verification link
      setAuthStep('email-verification')
    } catch (err) {
      console.error('Email auth failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to send email verification')
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setError(null)
      // Implement Google OAuth integration
      setError('Google authentication is not yet implemented')
    } catch (err) {
      console.error('Google auth failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Google')
    }
  }

  const handleAppleAuth = async () => {
    try {
      setError(null)
      // Implement Apple OAuth integration
      setError('Apple authentication is not yet implemented')
    } catch (err) {
      console.error('Apple auth failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Apple')
    }
  }

  const handleFacebookAuth = async () => {
    try {
      setError(null)
      // Implement Facebook OAuth integration
      setError('Facebook authentication is not yet implemented')
    } catch (err) {
      console.error('Facebook auth failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Facebook')
    }
  }

  if (!isInitialized) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Initializing Turnkey...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Turnkey Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Secure, keyless authentication for your wallet
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConnected && address ? (
          // Connected State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Connected Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your Turnkey wallet is ready to use
              </p>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Connected Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-foreground">{formatAddress(address)}</p>
                    <p className="text-xs text-muted-foreground">
                      {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {wallets.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Switch Wallet</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {wallets.map((wallet) => (
                    <Button
                      key={wallet.walletId}
                      variant="outline"
                      size="sm"
                      onClick={() => handleWalletSwitch(wallet.walletId)}
                      className="w-full justify-start text-left h-auto p-3"
                      disabled={isConnecting}
                    >
                      <div>
                        <p className="font-medium text-sm">{wallet.walletName}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.walletId.slice(0, 8)}...{wallet.walletId.slice(-4)}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={disconnect}
                className="flex-1"
                disabled={isConnecting}
              >
                Disconnect
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1"
                disabled={isConnecting}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        ) : authStep === 'email-verification' ? (
          // Email Verification Step
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to {userEmail}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePasskeyLogin}
                disabled={isAuthenticating}
                className="w-full"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Continue with Passkey
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setAuthStep('initial')}
                className="w-full"
              >
                Back to sign in
              </Button>
            </div>
          </motion.div>
        ) : (
          // Authentication State
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            disabled={isAuthenticating}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handlePasskeyLogin}
                      disabled={isAuthenticating || isConnecting}
                      className="w-full font-semibold"
                      type="button"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="h-4 w-4 mr-2" />
                          Continue with passkey
                        </>
                      )}
                    </Button>

                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full font-semibold"
                      disabled={!form.formState.isValid || isAuthenticating}
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Continue with email
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleWalletLogin}
                      disabled={isAuthenticating || isConnecting}
                      className="w-full font-semibold"
                      type="button"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Continue with wallet
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                  Continue with Google
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAppleAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleFacebookAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            disabled={isAuthenticating}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="wallet-name" className="text-sm font-medium">
                      Wallet Name (Optional)
                    </Label>
                    <Input
                      id="wallet-name"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder="My Turnkey Wallet"
                      disabled={isAuthenticating || isConnecting}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full font-semibold"
                    disabled={!form.formState.isValid || isAuthenticating}
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Account with Email
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                  Sign up with Google
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAppleAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Sign up with Apple
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleFacebookAuth}
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Sign up with Facebook
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• No seed phrases or private keys to manage</p>
                <p>• Secured by biometric authentication</p>
                <p>• Enterprise-grade security infrastructure</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}