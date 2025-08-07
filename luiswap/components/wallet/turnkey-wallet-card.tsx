'use client'

import { useTurnkeyWallet, formatBalanceForDisplay } from '@/hooks/use-turnkey-wallet'
import { useWalletTokens } from '@/hooks/use-wallet-tokens'
import { useAuth } from '@/contexts/auth-provider'
import { CopyIcon, Wallet } from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AddFundsButton } from './add-funds-button'
import { SendReceiveDialog } from './send-receive-dialog'
import { ImportWalletDialog } from './import-wallet-dialog'
import { ExportWalletDialog } from './export-wallet-dialog'

interface TurnkeyWalletCardProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum' | 'celo'
}

export function TurnkeyWalletCard({ className, selectedNetwork }: TurnkeyWalletCardProps) {
  const { user } = useAuth()
  const { loading, walletInfo, selectedWallet, selectedAccount, error } = useTurnkeyWallet(selectedNetwork)
  const { 
    loading: tokensLoading, 
    getTotalValueUSD, 
    hasTokens,
    getNativeToken 
  } = useWalletTokens(walletInfo?.address, selectedNetwork)

  const handleCopyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address)
      toast.success('Address copied to clipboard')
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

  if (!loading && !walletInfo) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No account found for this network</p>
            <p className="text-sm text-muted-foreground">Your wallet may need additional network setup</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-row items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="font-medium">
              {loading ? (
                <Skeleton className="h-4 w-32 bg-muted-foreground/50" />
              ) : (
                selectedWallet?.walletName || 'Turnkey Wallet'
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedAccount?.networkConfig ? 
                  `${selectedAccount.networkConfig.name} (${selectedAccount.networkConfig.testnet})` : 
                  'Unknown Network'
                }
              </Badge>
            </div>
          </div>

          {/* Desktop buttons - smaller and aligned with title */}
          <div className="hidden lg:flex items-center gap-1.5 ml-4">
            <AddFundsButton selectedNetwork={selectedNetwork} size="sm" variant="outline" />
            <SendReceiveDialog selectedNetwork={selectedNetwork} />
            <ImportWalletDialog selectedNetwork={selectedNetwork} />
            <ExportWalletDialog selectedNetwork={selectedNetwork} />
          </div>
          
          {/* Tablet buttons - below 1024px but above 800px */}
          <div className="hidden md:flex lg:hidden items-center gap-1.5 ml-4">
            <AddFundsButton selectedNetwork={selectedNetwork} size="sm" variant="outline" />
            <SendReceiveDialog selectedNetwork={selectedNetwork} />
          </div>
        </div>
        
        {/* Tablet secondary row - for import/export on medium screens */}
        <div className="hidden md:flex lg:hidden items-center justify-end gap-1.5 mt-3">
          <ImportWalletDialog selectedNetwork={selectedNetwork} />
          <ExportWalletDialog selectedNetwork={selectedNetwork} />
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

        {/* Balance - Show Total Portfolio Value */}
        <div className="space-y-1">
          <div className="text-4xl font-bold">
            ${(loading || tokensLoading) ? '0.00' : getTotalValueUSD().toFixed(2)}
            <span className="ml-1 text-sm text-muted-foreground">USD</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading || tokensLoading ? (
              <Skeleton className="h-3 w-16 bg-muted-foreground/50 inline-block" />
            ) : hasTokens ? (
              (() => {
                const nativeToken = getNativeToken()
                return nativeToken ? 
                  `${parseFloat(nativeToken.balance).toFixed(6)} ${nativeToken.symbol}` + 
                  (hasTokens && nativeToken ? ' + more assets' : '') :
                  'Multiple assets'
              })()
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

      <CardFooter className="md:hidden">
        <div className="space-y-3 w-full">
          {/* Mobile layout for screens above 450px */}
          <div className="hidden min-[450px]:block space-y-2">
            <div className="flex w-full items-center gap-2">
              <AddFundsButton selectedNetwork={selectedNetwork} className="flex-1" size="sm" />
              <SendReceiveDialog selectedNetwork={selectedNetwork} />
            </div>
            <div className="flex w-full items-center gap-2">
              <ImportWalletDialog selectedNetwork={selectedNetwork} />
              <ExportWalletDialog selectedNetwork={selectedNetwork} />
            </div>
          </div>
          
          {/* Very small mobile layout for screens 450px and below */}
          <div className="block min-[450px]:hidden space-y-2">
            <AddFundsButton selectedNetwork={selectedNetwork} className="w-full" size="sm" />
            <div className="flex w-full items-center gap-2">
              <SendReceiveDialog selectedNetwork={selectedNetwork} />
            </div>
            <div className="flex w-full items-center gap-2">
              <ImportWalletDialog selectedNetwork={selectedNetwork} />
              <ExportWalletDialog selectedNetwork={selectedNetwork} />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}