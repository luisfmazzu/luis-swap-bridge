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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, AlertTriangle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWeb3 } from '@/hooks/use-web3'

interface TraditionalWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TraditionalWalletModal({ open, onOpenChange, onSuccess }: TraditionalWalletModalProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const {
    connectors,
    connect,
    isConnecting,
  } = useWeb3()

  const handleConnect = async (connectorId: string) => {
    try {
      setConnectionError(null)
      connect(connectorId)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Connection error:', error)
      if (error instanceof Error) {
        setConnectionError(error.message)
      } else {
        setConnectionError('Failed to connect wallet. Please try again.')
      }
    }
  }

  const handleClose = () => {
    setConnectionError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your preferred wallet to connect to LuiSwap
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {connectionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          {connectors.map((connector, index) => (
            <motion.div
              key={connector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={() => handleConnect(connector.id)}
                disabled={isConnecting}
                className="w-full justify-start h-12 bg-card border-border hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Wallet className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{connector.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {connector.id === 'metaMask' && 'Connect using MetaMask browser extension'}
                      {connector.id === 'walletConnect' && 'Scan with mobile wallet'}
                      {connector.id === 'coinbaseWallet' && 'Connect with Coinbase Wallet'}
                      {!['metaMask', 'walletConnect', 'coinbaseWallet'].includes(connector.id) && 
                        `Connect using ${connector.name}`
                      }
                    </div>
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}