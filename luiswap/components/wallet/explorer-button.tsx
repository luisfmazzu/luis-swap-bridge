'use client'

import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ExplorerButtonProps {
  selectedNetwork?: 'tron' | 'ethereum'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ExplorerButton({ 
  selectedNetwork, 
  variant = 'outline',
  size = 'sm',
  className
}: ExplorerButtonProps) {
  const { walletInfo, selectedAccount } = useTurnkeyWallet(selectedNetwork)

  const handleViewOnExplorer = () => {
    if (walletInfo?.address && selectedAccount?.networkConfig) {
      const explorerUrl = `${selectedAccount.networkConfig.explorerUrl}${walletInfo.address}`
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={handleViewOnExplorer}
      disabled={!walletInfo?.address}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      Explorer
    </Button>
  )
}