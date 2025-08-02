'use client'

import { useState } from 'react'
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
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import { useWeb3 } from '@/hooks/use-web3'
import { getChainName, getChainColor } from '@/lib/constants/chains'
import { motion } from 'framer-motion'

interface WalletConnectButtonProps {
  className?: string
}

export function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletInfo, setShowWalletInfo] = useState(false)
  
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

  const handleConnect = (connectorId: string) => {
    connect(connectorId)
    setIsOpen(false)
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const handleViewOnExplorer = () => {
    if (address && currentChain) {
      const explorerUrl = `${currentChain.blockExplorerUrls[0]}/address/${address}`
      window.open(explorerUrl, '_blank')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowWalletInfo(false)
  }

  if (isConnected && address) {
    return (
      <Dialog open={showWalletInfo} onOpenChange={setShowWalletInfo}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className={`bg-card border-border hover:bg-accent ${className}`}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isChainSupported ? '#10B981' : '#EF4444' }}
              />
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
                <span className="font-mono text-sm flex-1">{address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewOnExplorer}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Network</label>
              <div className="flex items-center gap-2">
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
                    Unsupported
                  </Badge>
                )}
              </div>
            </div>

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
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