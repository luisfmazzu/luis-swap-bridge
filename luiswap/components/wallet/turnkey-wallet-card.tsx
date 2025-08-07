'use client'

import { useEffect, useState } from 'react'
import { useTurnkeyWallet, formatBalanceForDisplay, calculateUSDValue } from '@/hooks/use-turnkey-wallet'
import { useAuth } from '@/contexts/auth-provider'
import { CopyIcon, Wallet, ExternalLink, HandCoins } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface TurnkeyWalletCardProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum'
}

export function TurnkeyWalletCard({ className, selectedNetwork }: TurnkeyWalletCardProps) {
  const { user } = useAuth()
  const { loading, walletInfo, selectedWallet, selectedAccount, error } = useTurnkeyWallet(selectedNetwork)
  const [usdAmount, setUsdAmount] = useState<number>(0)

  useEffect(() => {
    if (walletInfo?.balance && selectedAccount?.networkConfig) {
      const calculatedUSD = calculateUSDValue(walletInfo.balance, selectedAccount.networkConfig)
      setUsdAmount(calculatedUSD)
    }
  }, [walletInfo?.balance, selectedAccount?.networkConfig])

  const handleCopyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address)
      toast.success('Address copied to clipboard')
    }
  }

  const handleViewOnExplorer = () => {
    if (walletInfo?.address && selectedAccount?.networkConfig) {
      const explorerUrl = `${selectedAccount.networkConfig.explorerUrl}${walletInfo.address}`
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Please authenticate with Turnkey to view wallet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <p className="text-destructive">Error loading wallet: {error}</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="font-medium">
            {loading ? (
              <Skeleton className="h-4 w-32 bg-muted-foreground/50" />
            ) : (
              selectedWallet?.walletName || 'Turnkey Wallet'
            )}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              Turnkey Embedded Wallet
            </Badge>
            <Badge variant="outline" className="text-xs">
              {selectedAccount?.networkConfig ? 
                `${selectedAccount.networkConfig.name} (${selectedAccount.networkConfig.testnet})` : 
                'Unknown Network'
              }
            </Badge>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewOnExplorer}
            disabled={loading || !walletInfo}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Explorer
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Wallet Address</div>
          {loading ? (
            <Skeleton className="h-4 w-48 bg-muted-foreground/50" />
          ) : walletInfo ? (
            <div
              onClick={handleCopyAddress}
              className="flex items-center gap-2 cursor-pointer hover:text-foreground/80 transition-colors"
            >
              <span className="font-mono text-sm">{walletInfo.formattedAddress}</span>
              <CopyIcon className="h-3 w-3" />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No address available</span>
          )}
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <div className="text-4xl font-bold">
            ${loading ? '0.00' : usdAmount.toFixed(2)}
            <span className="ml-1 text-sm text-muted-foreground">USD</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-3 w-16 bg-muted-foreground/50 inline-block" />
            ) : walletInfo?.balance && selectedAccount?.networkConfig ? (
              `${formatBalanceForDisplay(walletInfo.balance, selectedAccount.networkConfig)} ${selectedAccount.networkConfig.symbol}`
            ) : (
              `0 ${selectedAccount?.networkConfig?.symbol || 'TOKEN'}`
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="pt-2 border-t space-y-1">
          <div className="text-sm text-muted-foreground">Account</div>
          <div className="text-sm">{user.email}</div>
        </div>
      </CardContent>

      <CardFooter className="sm:hidden">
        <div className="flex w-full items-center gap-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleViewOnExplorer}
            disabled={loading || !walletInfo}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}