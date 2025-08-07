'use client'

import { useMemo } from 'react'
import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { formatEther } from 'viem'

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

// Mock ETH price - in production you'd use a real price feed
const MOCK_ETH_PRICE = 3500

// Simple Ethereum icon component
function EthereumIcon({ className }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs`}>
      ETH
    </div>
  )
}

interface TurnkeyAssetsProps {
  className?: string
}

export function TurnkeyAssets({ className }: TurnkeyAssetsProps) {
  const { loading, walletInfo } = useTurnkeyWallet()

  // Memoize the balance calculation
  const amount = useMemo(() => {
    return walletInfo?.balance
      ? parseFloat(
          Number(formatEther(walletInfo.balance)).toFixed(8)
        ).toString()
      : '0'
  }, [walletInfo?.balance])

  // Memoize the value calculation
  const valueInUSD = useMemo(() => {
    return (
      Number(formatEther(walletInfo?.balance ?? BigInt(0))) * MOCK_ETH_PRICE
    ).toFixed(2)
  }, [walletInfo?.balance])

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
                  <EthereumIcon className="h-8 w-8" />
                  <div>
                    <div className="font-medium">Ethereum</div>
                    <div className="text-xs text-muted-foreground">Sepolia Testnet</div>
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
                        <span className="ml-1 text-xs text-muted-foreground">ETH</span>
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
              No assets found. Get some testnet ETH from a faucet to see your balance.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Visit{' '}
              <a 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Sepolia Faucet
              </a>
              {' '}to get test ETH
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}