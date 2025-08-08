'use client'

import { useState, useCallback } from 'react'
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
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut, 
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useUnifiedWallet, useWalletConnection, useWalletActions } from '@/contexts/unified-wallet-provider'
import { useAuth } from '@/contexts/auth-provider'
import { getChainName, getChainColor } from '@/lib/constants/chains'
import { WalletSelectionModal } from './wallet-selection-modal'
import { TurnkeyAuthModal } from './turnkey-auth-modal'
import { TraditionalWalletModal } from './traditional-wallet-modal'
import { ClientWrapper } from '../web3/client-wrapper'

interface UnifiedConnectionManagerProps {
  className?: string
  showChainInfo?: boolean
  variant?: 'default' | 'outline' | 'ghost'
}

function UnifiedConnectionManagerContent({ 
  className = '', 
  showChainInfo = true, 
  variant = 'default' 
}: UnifiedConnectionManagerProps) {
  const [showWalletInfo, setShowWalletInfo] = useState(false)
  const [showWalletSelection, setShowWalletSelection] = useState(false)
  const [showTurnkeyAuth, setShowTurnkeyAuth] = useState(false)
  const [showTraditionalWallet, setShowTraditionalWallet] = useState(false)
  
  // Use unified wallet state (single source of truth)
  const { state } = useUnifiedWallet()
  const { isConnected, isConnecting, address, connectionType, chainId } = useWalletConnection()
  const { disconnect } = useWalletActions()
  const { logout } = useAuth()

  const handleCopyAddress = useCallback(async () => {
    if (address && navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(address)
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }, [address])

  const handleViewOnExplorer = useCallback(() => {
    if (address && state.wagmiChainId) {
      const chainInfo = getChainName(state.wagmiChainId)
      // This would need to be implemented based on chain info
      const explorerUrl = `https://etherscan.io/address/${address}`
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }, [address, state.wagmiChainId])

  const handleDisconnect = useCallback(() => {
    if (connectionType === 'turnkey') {
      logout()
    } else {
      // Disconnect wagmi wallet - unified provider will sync state
      disconnect()
    }
    setShowWalletInfo(false)
  }, [connectionType, logout, disconnect])

  // Modal handlers
  const handleWalletSelectionClose = useCallback(() => {
    setShowWalletSelection(false)
  }, [])

  const handleSelectTurnkey = useCallback(() => {
    setShowWalletSelection(false)
    setShowTurnkeyAuth(true)
  }, [])

  const handleSelectTraditional = useCallback(() => {
    setShowWalletSelection(false)
    setShowTraditionalWallet(true)
  }, [])

  const handleTurnkeySuccess = useCallback((address: string) => {
    setShowTurnkeyAuth(false)
    console.log('Turnkey connected with address:', address)
  }, [])

  const handleTraditionalSuccess = useCallback(() => {
    setShowTraditionalWallet(false)
  }, [])

  // Render based on unified connection status
  switch (state.connectionStatus) {
    case 'initializing':
      return (
        <Button 
          variant={variant}
          className={className}
          disabled
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      )

    case 'connected':
      if (!address) return null // Safety check
      
      return (
        <Dialog open={showWalletInfo} onOpenChange={setShowWalletInfo}>
          <DialogTrigger asChild>
            <Button 
              variant={variant}
              className={`${className} ${variant === 'outline' ? 'bg-card border-border hover:bg-accent' : ''}`}
            >
              <div className="flex items-center gap-2">
                {showChainInfo && chainId && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#10B981' }}
                  />
                )}
                <span className="font-mono text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
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
              {/* Connection Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Connection Type</label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-border">
                    {connectionType === 'turnkey' ? 'Turnkey Embedded Wallet' : 'Traditional Wallet'}
                  </Badge>
                  {connectionType === 'turnkey' && state.turnkeyUser && (
                    <Badge variant="secondary" className="text-xs">
                      {state.turnkeyUser.email ? 'Email Authentication' : 'Passkey'}
                    </Badge>
                  )}
                </div>
              </div>

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewOnExplorer}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
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

    case 'connecting':
      return (
        <Button 
          variant={variant}
          className={className}
          disabled
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </Button>
      )

    case 'error':
      return (
        <Button 
          variant="outline"
          className={`${className} border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground`}
          onClick={() => setShowWalletSelection(true)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Connection Error
        </Button>
      )

    case 'disconnected':
    default:
      return (
        <>
          <Button 
            variant={variant}
            className={`${className} ${variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
            onClick={() => setShowWalletSelection(true)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>

          {/* Wallet Selection Modal */}
          <WalletSelectionModal
            open={showWalletSelection}
            onOpenChange={handleWalletSelectionClose}
            onSelectTurnkey={handleSelectTurnkey}
            onSelectTraditional={handleSelectTraditional}
          />

          {/* Turnkey Authentication Modal */}
          <TurnkeyAuthModal
            open={showTurnkeyAuth}
            onOpenChange={setShowTurnkeyAuth}
            onSuccess={handleTurnkeySuccess}
          />

          {/* Traditional Wallet Modal */}
          <TraditionalWalletModal
            open={showTraditionalWallet}
            onOpenChange={setShowTraditionalWallet}
            onSuccess={handleTraditionalSuccess}
          />
        </>
      )
  }
}

export function UnifiedConnectionManager(props: UnifiedConnectionManagerProps) {
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
      <UnifiedConnectionManagerContent {...props} />
    </ClientWrapper>
  )
}