'use client'

import { useMemo } from 'react'
import { useTurnkeyWallet, formatBalanceForDisplay, calculateUSDValue } from '@/hooks/use-turnkey-wallet'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic network icon component
function NetworkIcon({ networkId, symbol, className }: { networkId: string; symbol: string; className?: string }) {
  const getGradient = (networkId: string) => {
    switch (networkId) {
      case 'tron': return 'from-red-500 to-orange-500'
      case 'ethereum': return 'from-purple-500 to-blue-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className={`${className} rounded-full bg-gradient-to-r ${getGradient(networkId)} flex items-center justify-center text-white font-bold text-xs`}>
      {symbol.slice(0, 3).toUpperCase()}
    </div>
  )
}

interface TurnkeyAssetsProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum'
}

export function TurnkeyAssets({ className, selectedNetwork }: TurnkeyAssetsProps) {
  const { loading, walletInfo, selectedAccount } = useTurnkeyWallet(selectedNetwork)

  // Memoize the balance calculation
  const amount = useMemo(() => {
    if (!walletInfo?.balance || !selectedAccount?.networkConfig) return '0'
    return formatBalanceForDisplay(walletInfo.balance, selectedAccount.networkConfig)
  }, [walletInfo?.balance, selectedAccount?.networkConfig])

  // Memoize the value calculation
  const valueInUSD = useMemo(() => {
    if (!walletInfo?.balance || !selectedAccount?.networkConfig) return '0.00'
    return calculateUSDValue(walletInfo.balance, selectedAccount.networkConfig).toFixed(2)
  }, [walletInfo?.balance, selectedAccount?.networkConfig])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg sm:text-2xl">Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="hidden sm:table-cell">Address</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="p-2 font-medium sm:p-4">
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <NetworkIcon 
                    networkId={selectedAccount?.networkConfig?.id || 'ethereum'}
                    symbol={selectedAccount?.networkConfig?.symbol || 'TOKEN'}
                    className="h-8 w-8"
                  />
                  <div>
                    <div className="font-medium">
                      {selectedAccount?.networkConfig?.name || 'Unknown Network'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedAccount?.networkConfig?.testnet || 'Unknown Testnet'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden font-mono text-xs sm:table-cell">
                {loading ? (
                  <Skeleton className="h-3 w-24 bg-muted-foreground/50" />
                ) : (
                  walletInfo?.formattedAddress || 'No address'
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {loading ? (
                  <Skeleton className="h-4 w-16 bg-muted-foreground/50" />
                ) : (
                  amount
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {loading ? (
                  <Skeleton className="h-4 w-12 bg-muted-foreground/50" />
                ) : (
                  `$${valueInUSD}`
                )}
              </TableCell>
              <TableCell className="p-2 sm:hidden">
                <div className="space-y-1">
                  <div className="font-medium">
                    {loading ? (
                      <Skeleton className="h-4 w-12 bg-muted-foreground/50" />
                    ) : (
                      <>
                        {amount}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {selectedAccount?.networkConfig?.symbol || 'TOKEN'}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {loading ? (
                      <Skeleton className="h-3 w-16 bg-muted-foreground/50" />
                    ) : (
                      `$${valueInUSD}`
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {!loading && amount === '0' && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No assets found. Get some testnet {selectedAccount?.networkConfig?.symbol || 'tokens'} from a faucet to see your balance.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Visit{' '}
              <a 
                href={selectedAccount?.networkConfig?.faucetUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {selectedAccount?.networkConfig?.name || 'Network'} Faucet
              </a>
              {' '}to get test {selectedAccount?.networkConfig?.symbol || 'tokens'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}