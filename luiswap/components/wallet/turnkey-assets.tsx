'use client'

import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { useWalletTokens } from '@/hooks/use-wallet-tokens'
import { getTokenIconGradient, formatTokenBalance, formatTokenBalanceMobile } from '@/lib/token-utils'
import { NumberModal } from '@/components/ui/number-modal'

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
import { Badge } from '@/components/ui/badge'

// Dynamic token icon component
function TokenIcon({ 
  symbol, 
  networkId, 
  isNative, 
  className = "h-8 w-8" 
}: { 
  symbol: string
  networkId: string
  isNative: boolean
  className?: string
}) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-r ${getTokenIconGradient(symbol, networkId, isNative)} flex items-center justify-center text-white font-bold text-xs`}>
      {symbol.slice(0, 3).toUpperCase()}
    </div>
  )
}

interface TurnkeyAssetsProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum' | 'celo'
}

export function TurnkeyAssets({ className, selectedNetwork }: TurnkeyAssetsProps) {
  const { walletInfo } = useTurnkeyWallet(selectedNetwork)
  const { tokens, loading, pricesLoading, error, getTotalValueUSD, hasTokens } = useWalletTokens(
    walletInfo?.address, 
    selectedNetwork
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-2xl">Assets</CardTitle>
          {hasTokens && !loading && (
            <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
              <span className="hidden xs:inline">{tokens.length} {tokens.length === 1 ? 'Asset' : 'Assets'}</span>
              <span className="xs:hidden">{tokens.length}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Price</TableHead>
              <TableHead>Value (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="p-2 font-medium sm:p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              // Error state
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-destructive">Failed to load assets</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : hasTokens ? (
              // Show detected tokens
              tokens.map((token) => (
                <TableRow key={`${token.address}-${token.symbol}`}>
                  <TableCell className="p-2 font-medium sm:p-4">
                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                      <TokenIcon 
                        symbol={token.symbol}
                        networkId={token.network}
                        isNative={token.isNative}
                        className="h-8 w-8"
                      />
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={token.isNative ? "default" : "secondary"} className="text-xs">
                      {token.isNative ? "Native" : "Token"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <NumberModal 
                      fullNumber={formatTokenBalance(token.balance, token.decimals, 18)}
                      label="Token Balance"
                      symbol={token.symbol}
                    >
                      <div className="font-medium">
                        {/* Desktop: Show full precision, Mobile: Show shortened */}
                        <span className="hidden sm:inline">
                          {formatTokenBalance(token.balance, token.decimals)}
                        </span>
                        <span className="sm:hidden">
                          {formatTokenBalanceMobile(token.balance, token.decimals)}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground sm:hidden">
                          {token.symbol}
                        </span>
                      </div>
                    </NumberModal>
                  </TableCell>
                  
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {token.priceUSD === -1 ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      `$${token.priceUSD.toFixed(2)}`
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {token.valueUSD === -1 ? (
                      <div>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <div className="text-xs text-muted-foreground sm:hidden">
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">
                          ${token.valueUSD.toFixed(2)}
                        </div>
                        {/* Mobile: show price below value */}
                        <div className="text-xs text-muted-foreground sm:hidden">
                          ${token.priceUSD.toFixed(2)} each
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">
                      No assets found in this wallet.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get some testnet tokens from a faucet to see your balance.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Total Value Summary */}
        {hasTokens && !loading && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
              {pricesLoading || tokens.some(t => t.valueUSD === -1) ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <NumberModal 
                  fullNumber={getTotalValueUSD().toString()}
                  label="Total Portfolio Value"
                  symbol="USD"
                >
                  <span className="text-lg font-semibold">
                    ${getTotalValueUSD().toFixed(2)}
                  </span>
                </NumberModal>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}