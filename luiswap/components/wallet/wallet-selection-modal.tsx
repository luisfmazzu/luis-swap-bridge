'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Shield, Zap, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WalletSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTurnkey: () => void
  onSelectTraditional: () => void
}

type ModalStep = 'selection' | 'traditional'

export function WalletSelectionModal({ 
  open, 
  onOpenChange, 
  onSelectTurnkey,
  onSelectTraditional 
}: WalletSelectionModalProps) {
  const [step, setStep] = useState<ModalStep>('selection')

  const handleClose = () => {
    setStep('selection')
    onOpenChange(false)
  }


  const handleTurnkeySelect = () => {
    onSelectTurnkey()
  }

  const handleTraditionalSelect = () => {
    setStep('traditional')
    onSelectTraditional()
  }

  const handleBack = () => {
    setStep('selection')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-foreground text-center">Connect Your Wallet</DialogTitle>
                <DialogDescription className="text-muted-foreground text-center">
                  Choose how you'd like to connect to LuiSwap
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                {/* Turnkey Option */}
                <Card 
                  className="cursor-pointer border-border hover:border-primary/50 transition-colors group"
                  onClick={handleTurnkeySelect}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Connect with Turnkey
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Secure, keyless wallet solution
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        <span>No seed phrases or private keys</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        <span>Biometric authentication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        <span>Enterprise-grade security</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Traditional Wallets Option */}
                <Card 
                  className="cursor-pointer border-border hover:border-primary/50 transition-colors group"
                  onClick={handleTraditionalSelect}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Connect with Traditional Wallet
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          MetaMask, WalletConnect, and more
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <span>Use your existing wallet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <span>Wide compatibility</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <span>Familiar experience</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-xs text-muted-foreground mt-6">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </div>
            </motion.div>
          )}

          {step === 'traditional' && (
            <motion.div
              key="traditional"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-1 h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Choose your preferred wallet
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6">
                {/* Traditional wallet connectors will go here */}
                <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-lg">
                  <div className="text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Traditional wallet connectors will be embedded here
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}