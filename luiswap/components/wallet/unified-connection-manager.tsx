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
import { useTurnkey } from '@/hooks/use-turnkey'
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
  const { disconnectAll } = useWalletStore()
  const { disconnect: disconnectTurnkey } = useTurnkey()
  const { disconnect: disconnectWagmi, currentChain, isChainSupported, formatAddress } = useWeb3()

  // Get the current chain info based on active wallet
  const chainId = activeWallet?.chainId
  const address = activeWallet?.address
  const isConnected = activeWallet?.isConnected || false

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
    if (activeWallet?.type === 'turnkey') {
      disconnectTurnkey()
    } else if (activeWallet?.type === 'wagmi') {
      disconnectWagmi()
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

  const handleTurnkeySuccess = () => {
    setShowTurnkeyAuth(false)
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
              <span className="font-mono text-sm">{formatAddress(address)}</span>
              {activeWallet?.type === 'turnkey' && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Turnkey
                </Badge>
              )}
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
                  {activeWallet?.type === 'turnkey' ? 'Turnkey Wallet' : 'Traditional Wallet'}
                </Badge>
                {activeWallet?.type === 'turnkey' && (
                  <Badge variant="secondary" className="text-xs">
                    Keyless
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