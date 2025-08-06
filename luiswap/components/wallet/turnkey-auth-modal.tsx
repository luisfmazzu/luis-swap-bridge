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
  CheckCircle2 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTurnkey } from '@/hooks/use-turnkey'

interface TurnkeyAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TurnkeyAuthModal({ open, onOpenChange, onSuccess }: TurnkeyAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [newWalletName, setNewWalletName] = useState('')
  const [error, setError] = useState<string | null>(null)
  
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
    onOpenChange(false)
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
                          {formatAddress(wallet.accounts[0]?.address)}
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
        ) : (
          // Authentication State
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-3">
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Fingerprint className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Passkey Authentication</CardTitle>
                        <CardDescription className="text-xs">
                          Use biometrics or security key
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={handlePasskeyLogin}
                      disabled={isAuthenticating || isConnecting}
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
                          Sign in with Passkey
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Browser Wallet</CardTitle>
                        <CardDescription className="text-xs">
                          Connect with existing wallet
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      onClick={handleWalletLogin}
                      disabled={isAuthenticating || isConnecting}
                      className="w-full"
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Create New Wallet</CardTitle>
                      <CardDescription className="text-xs">
                        Secure wallet with no seed phrases
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-name" className="text-sm font-medium">
                      Wallet Name
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
                    onClick={handleCreateWallet}
                    disabled={isAuthenticating || isConnecting || !newWalletName.trim()}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Wallet...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Wallet
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

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