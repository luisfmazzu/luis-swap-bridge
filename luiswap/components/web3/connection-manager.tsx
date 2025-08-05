'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertTriangle } from 'lucide-react'
import { useWeb3 } from '@/hooks/use-web3'
import { getChainName, getChainColor } from '@/lib/constants/chains'
import { motion } from 'framer-motion'
import { ClientWrapper } from './client-wrapper'

interface ConnectionManagerProps {
  className?: string
  showChainInfo?: boolean
  variant?: 'default' | 'outline' | 'ghost'
}

function ConnectionManagerContent({ className = '', showChainInfo = true, variant = 'default' }: ConnectionManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletInfo, setShowWalletInfo] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    currentChain,
    isChainSupported,
    connectors,
    connect,
    disconnect,
    formatAddress,
  } = useWeb3()

  const handleConnect = async (connectorId: string) => {
    try {
      setConnectionError(null) // Clear any previous errors
      connect(connectorId)
      setIsOpen(false)
    } catch (error) {
      console.error('Connection error:', error)
      // Handle connection errors gracefully
      if (error instanceof Error) {
        setConnectionError(error.message)
        console.warn('Failed to connect wallet:', error.message)
      } else {
        setConnectionError('Failed to connect wallet. Please try again.')
      }
    }
  }

  const handleCopyAddress = async () => {
    if (address && navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(address)
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const handleViewOnExplorer = () => {
    if (address && currentChain?.blockExplorerUrls?.[0]) {
      const explorerUrl = `${currentChain.blockExplorerUrls[0]}/address/${address}`
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowWalletInfo(false)
  }

  // Connected state
  if (isConnected && address) {
    return (
      <Dialog open={showWalletInfo} onOpenChange={setShowWalletInfo}>
        <DialogTrigger asChild>
          <Button 
            variant={variant}
            className={`${className} ${variant === 'outline' ? 'bg-card border-border hover:bg-accent' : ''}`}
          >
            <div className="flex items-center gap-2">
              {showChainInfo && (
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isChainSupported ? '#10B981' : '#EF4444' }}
                />
              )}
              <span className="font-mono text-sm">{formatAddress(address)}</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Wallet Info</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your wallet connection and view account details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="font-mono text-sm flex-1 break-all">{address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {currentChain?.blockExplorerUrls?.[0] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewOnExplorer}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Network */}
            {showChainInfo && chainId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Network</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="border-border"
                    style={{ 
                      borderColor: getChainColor(chainId),
                      color: getChainColor(chainId)
                    }}
                  >
                    {getChainName(chainId)}
                  </Badge>
                  {!isChainSupported && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unsupported
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Disconnect */}
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Disconnected state
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant}
          className={`${className} ${variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you'd like to connect your wallet to start using LuiSwap
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {connectionError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive font-medium">Connection Failed</p>
              </div>
              <p className="text-xs text-destructive/80 mt-1">{connectionError}</p>
            </div>
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
                className="w-full justify-start h-12 bg-card border-border hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-primary" />
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

export function ConnectionManager(props: ConnectionManagerProps) {
  return (
    <ClientWrapper 
      fallback={
        <Button 
          variant={props.variant || 'default'} 
          className={props.className}
          disabled
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      }
    >
      <ConnectionManagerContent {...props} />
    </ClientWrapper>
  )
}