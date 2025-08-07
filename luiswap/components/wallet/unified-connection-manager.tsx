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
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut, 
  AlertTriangle 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useWeb3 } from '@/hooks/use-web3'
import { useActiveWallet, useWalletStore } from '@/lib/stores/wallet-store'
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
  
  const activeWallet = useActiveWallet()
  const { disconnectAll, disconnectTurnkey } = useWalletStore()
  const { disconnect: disconnectWagmi, currentChain, isChainSupported, formatAddress } = useWeb3()
  const { user, logout } = useAuth()

  // Priority logic: Turnkey authentication overrides wallet connections
  // If user is authenticated with Turnkey, show Turnkey info regardless of Wagmi state
  const turnkeyUser = user
  const hasTurnkeyAuth = !!turnkeyUser
  
  // For Turnkey authenticated users, we'll show a Turnkey-specific wallet view
  // For regular wallet connections, use the active wallet info
  const chainId = hasTurnkeyAuth ? undefined : activeWallet?.chainId
  const address = hasTurnkeyAuth ? turnkeyUser?.id : activeWallet?.address // Show sub-org ID as address for now
  const isConnected = hasTurnkeyAuth || activeWallet?.isConnected || false
  
  console.log('🔄 UnifiedConnectionManager: Turnkey auth state:', hasTurnkeyAuth)
  console.log('🔄 UnifiedConnectionManager: Active wallet:', activeWallet)
  console.log('🔄 UnifiedConnectionManager: User object:', turnkeyUser)

  const handleCopyAddress = async () => {
    const textToCopy = hasTurnkeyAuth ? turnkeyUser?.email || turnkeyUser?.id || '' : address
    if (textToCopy && navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy)
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
    // Priority: If Turnkey user is authenticated, log them out
    if (hasTurnkeyAuth) {
      console.log('🔄 UnifiedConnectionManager: Logging out Turnkey user')
      logout()
    } else if (activeWallet?.type === 'wagmi') {
      disconnectWagmi()
    } else if (activeWallet?.type === 'turnkey') {
      disconnectTurnkey()
    } else {
      // Fallback: disconnect all
      disconnectAll()
    }
    setShowWalletInfo(false)
  }

  const handleWalletSelectionClose = () => {
    setShowWalletSelection(false)
  }

  const handleSelectTurnkey = () => {
    setShowWalletSelection(false)
    setShowTurnkeyAuth(true)
  }

  const handleSelectTraditional = () => {
    setShowWalletSelection(false)
    setShowTraditionalWallet(true)
  }

  const handleTurnkeySuccess = (address: string) => {
    setShowTurnkeyAuth(false)
    // In a real implementation, you would connect this to your wallet store
    console.log('Turnkey connected with address:', address)
  }


  const handleTraditionalSuccess = () => {
    setShowTraditionalWallet(false)
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
              {showChainInfo && chainId && (
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isChainSupported ? '#10B981' : '#EF4444' }}
                />
              )}
              <span className="font-mono text-sm">
                {hasTurnkeyAuth ? 
                  (turnkeyUser?.email?.split('@')[0] || 'Turnkey User') : 
                  formatAddress(address)
                }
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
            {/* Wallet Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Connection Type</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border">
                  {hasTurnkeyAuth ? 'Turnkey Embedded Wallet' : 
                   activeWallet?.type === 'turnkey' ? 'Turnkey Wallet' : 'Traditional Wallet'}
                </Badge>
                {hasTurnkeyAuth && (
                  <Badge variant="secondary" className="text-xs">
                    Email Authentication
                  </Badge>
                )}
                {!hasTurnkeyAuth && activeWallet?.type === 'turnkey' && 'authMethod' in activeWallet && activeWallet.authMethod && (
                  <Badge variant="secondary" className="text-xs">
                    {activeWallet.authMethod === 'passkey' ? 'Passkey' : 
                     activeWallet.authMethod === 'email' ? 'Email' :
                     activeWallet.authMethod === 'google' ? 'Google' :
                     activeWallet.authMethod === 'apple' ? 'Apple' :
                     activeWallet.authMethod === 'facebook' ? 'Facebook' :
                     activeWallet.authMethod === 'wallet' ? 'Wallet Import' :
                     activeWallet.authMethod}
                  </Badge>
                )}
              </div>
            </div>

            {/* User Info / Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {hasTurnkeyAuth ? 'User Account' : 'Address'}
              </label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {hasTurnkeyAuth ? (
                  <div className="flex-1">
                    <div className="font-mono text-sm break-all">{turnkeyUser?.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {turnkeyUser?.id?.substring(0, 8)}...{turnkeyUser?.id?.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <span className="font-mono text-sm flex-1 break-all">{address}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!hasTurnkeyAuth && currentChain?.blockExplorerUrls?.[0] && (
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

  // Disconnected state - but don't show if Turnkey user is authenticated
  // Turnkey authentication overrides wallet connection flow
  if (hasTurnkeyAuth) {
    // User is authenticated with Turnkey but wallet state hasn't updated yet
    // This shouldn't normally happen, but show connected state as fallback
    console.log('⚠️ UnifiedConnectionManager: Turnkey user authenticated but not in connected state')
    return (
      <Button 
        variant={variant}
        className={className}
        onClick={() => setShowWalletInfo(true)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm">{turnkeyUser?.email?.split('@')[0] || 'Turnkey User'}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      </Button>
    )
  }

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