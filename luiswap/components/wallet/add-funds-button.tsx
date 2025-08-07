'use client'

import { useState } from 'react'
import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { HandCoins, ExternalLink, Loader } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddFundsButtonProps {
  selectedNetwork?: 'tron' | 'ethereum' | 'celo'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function AddFundsButton({ 
  selectedNetwork, 
  variant = 'default',
  size = 'default',
  className,
  children
}: AddFundsButtonProps) {
  const { walletInfo, selectedAccount } = useTurnkeyWallet(selectedNetwork)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const networkConfig = selectedAccount?.networkConfig

  const handleOpenFaucet = async () => {
    if (!networkConfig?.faucetUrl || !walletInfo?.address) {
      toast.error('Faucet not available for this network')
      return
    }

    setLoading(true)
    try {
      // Copy address to clipboard for all networks
      await navigator.clipboard.writeText(walletInfo.address)
      toast.success('Address copied to clipboard!')
      
      // Open faucet URL
      window.open(networkConfig.faucetUrl, '_blank', 'noopener,noreferrer')
      
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to open faucet:', error)
      toast.error('Failed to open faucet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className={className}>
            <HandCoins className="mr-2 h-4 w-4" />
            Add funds
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Testnet Funds</DialogTitle>
          <DialogDescription>
            Get free testnet tokens from the {networkConfig?.name} faucet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Network Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{networkConfig?.name}</div>
                  <Badge variant="outline" className="text-xs">
                    {networkConfig?.testnet}
                  </Badge>
                </div>
                <div 
                  className={`w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-white font-bold text-xs ${
                    networkConfig?.id === 'tron' 
                      ? 'from-red-500 to-orange-500'
                      : networkConfig?.id === 'celo'
                      ? 'from-green-500 to-yellow-500'
                      : 'from-purple-500 to-blue-500'
                  }`}
                >
                  {networkConfig?.symbol.slice(0, 3).toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Info */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Your Address</div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="font-mono text-sm break-all">
                {walletInfo?.address}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <HandCoins className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-medium">How to get testnet funds:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click "Open Faucet" below</li>
                  {networkConfig?.id === 'tron' && (
                    <li>Your address will be copied automatically</li>
                  )}
                  <li>Paste your address in the faucet website</li>
                  <li>Request testnet {networkConfig?.symbol}</li>
                  <li>Wait for tokens to arrive (usually 1-2 minutes)</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              onClick={handleOpenFaucet}
              disabled={loading || !networkConfig?.faucetUrl}
              className="w-full"
            >
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Open {networkConfig?.name} Faucet
            </Button>
            
            {/* TRON official docs button */}
            {networkConfig?.id === 'tron' && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => window.open('https://developers.tron.network/docs/getting-testnet-tokens-on-tron', '_blank', 'noopener,noreferrer')}
                className="w-full text-xs"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Official TRON Docs
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}