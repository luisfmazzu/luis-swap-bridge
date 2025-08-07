'use client'

import { useState } from 'react'
import { useEnhancedTokenDiscovery } from '@/hooks/use-enhanced-token-discovery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  SearchIcon, 
  WalletIcon, 
  TrendingUpIcon, 
  ShieldCheckIcon,
  AlertTriangleIcon,
  InfoIcon
} from 'lucide-react'

interface EnhancedTokenDiscoveryProps {
  className?: string
  defaultAddress?: string
  defaultNetwork?: 'tron' | 'ethereum' | 'celo'
}

export function EnhancedTokenDiscovery({ 
  className,
  defaultAddress = '',
  defaultNetwork = 'ethereum'
}: EnhancedTokenDiscoveryProps) {
  const [inputAddress, setInputAddress] = useState(defaultAddress)
  const [selectedNetwork, setSelectedNetwork] = useState<'tron' | 'ethereum' | 'celo'>(defaultNetwork)
  const [searchAddress, setSearchAddress] = useState(defaultAddress)

  const {
    tokens,
    loading,
    error,
    stats,
    getTokensByValue,
    getDiscoveryMethodBreakdown,
    getNativeToken,
    getERC20Tokens,
    getVerifiedTokens,
    getUnverifiedTokens,
    getTotalValueUSD,
    hasTokens,
  } = useEnhancedTokenDiscovery(searchAddress, selectedNetwork)

  const handleSearch = () => {
    if (inputAddress.trim()) {
      setSearchAddress(inputAddress.trim())
    }
  }

  const formatAddress = (address: string) => {
    if (address === 'native') return 'Native Token'
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  const formatValue = (value: number) => {
    if (value === 0) return '$0.00'
    if (value < 0.01) return '< $0.01'
    return `$${value.toFixed(2)}`
  }

  const getDiscoveryMethodColor = (method: string) => {
    const colors = {
      'native': 'bg-green-500',
      'alchemy': 'bg-blue-500',
      'api': 'bg-purple-500',
      'contract': 'bg-orange-500',
      'registry': 'bg-gray-500',
    }
    return colors[method as keyof typeof colors] || 'bg-gray-400'
  }

  const getDiscoveryMethodDescription = (method: string) => {
    const descriptions = {
      'native': 'Native blockchain balance query',
      'alchemy': 'Alchemy API token discovery',
      'api': 'Network-specific API discovery',
      'contract': 'Direct contract call discovery',
      'registry': 'Known token registry lookup',
    }
    return descriptions[method as keyof typeof descriptions] || 'Unknown method'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Enhanced Token Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter wallet address (0x... or T...)"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <Select value={selectedNetwork} onValueChange={(value: 'tron' | 'ethereum' | 'celo') => setSelectedNetwork(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="celo">Celo</SelectItem>
                <SelectItem value="tron">TRON</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={!inputAddress.trim() || loading}>
              {loading ? 'Discovering...' : 'Discover Tokens'}
            </Button>
          </div>

          {searchAddress && (
            <div className="text-sm text-muted-foreground">
              Analyzing: <span className="font-mono">{formatAddress(searchAddress)}</span> on{' '}
              <span className="capitalize font-medium">{selectedNetwork}</span> network
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && hasTokens && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalTokens}</div>
                    <div className="text-sm text-muted-foreground">Total Tokens</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{formatValue(getTotalValueUSD())}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.verifiedTokens}</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{Object.keys(stats.discoveryMethods).length}</div>
                    <div className="text-sm text-muted-foreground">Discovery Methods</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Tabs defaultValue="tokens" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tokens">All Tokens ({tokens.length})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({getVerifiedTokens().length})</TabsTrigger>
              <TabsTrigger value="unverified">Unverified ({getUnverifiedTokens().length})</TabsTrigger>
              <TabsTrigger value="methods">Discovery Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="tokens">
              <Card>
                <CardHeader>
                  <CardTitle>Discovered Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Discovery</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTokensByValue().map((token, index) => (
                        <TableRow key={`${token.address}-${index}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-sm text-muted-foreground">{token.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatAddress(token.address)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {parseFloat(token.balance).toFixed(token.decimals <= 6 ? token.decimals : 6)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {token.symbol}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatValue(token.valueUSD)}</div>
                              {token.priceUSD > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  ${token.priceUSD.toFixed(4)} per {token.symbol}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${getDiscoveryMethodColor(token.discoveryMethod)} text-white border-0`}
                            >
                              {token.discoveryMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {token.isNative && (
                                <Badge variant="outline" className="text-blue-600">
                                  Native
                                </Badge>
                              )}
                              {token.verified ? (
                                <Badge variant="outline" className="text-green-600">
                                  ✓ Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">
                                  ⚠ Unverified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verified">
              <Card>
                <CardHeader>
                  <CardTitle>Verified Tokens ({getVerifiedTokens().length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getVerifiedTokens().map((token, index) => (
                      <div key={`verified-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground">{token.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatValue(token.valueUSD)}</div>
                          <div className="text-sm text-muted-foreground">
                            {parseFloat(token.balance).toFixed(4)} {token.symbol}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unverified">
              <Card>
                <CardHeader>
                  <CardTitle>Unverified Tokens ({getUnverifiedTokens().length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {getUnverifiedTokens().length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>All discovered tokens are verified! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getUnverifiedTokens().map((token, index) => (
                        <div key={`unverified-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 dark:bg-orange-950">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
                              {token.symbol}
                            </div>
                            <div className="text-sm text-muted-foreground">{token.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Discovered via: {getDiscoveryMethodDescription(token.discoveryMethod)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatValue(token.valueUSD)}</div>
                            <div className="text-sm text-muted-foreground">
                              {parseFloat(token.balance).toFixed(4)} {token.symbol}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methods">
              <Card>
                <CardHeader>
                  <CardTitle>Discovery Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(getDiscoveryMethodBreakdown()).map(([method, data]) => (
                      <div key={method} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getDiscoveryMethodColor(method)}`} />
                            <span className="font-medium capitalize">{method}</span>
                            <Badge variant="outline">{data.count} tokens</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground ml-5">
                          {getDiscoveryMethodDescription(method)}
                        </div>
                        <div className="ml-5 space-y-1">
                          {data.tokens.map((token, index) => (
                            <div key={index} className="text-sm flex items-center justify-between py-1">
                              <span>{token.symbol} - {token.name}</span>
                              <span className="text-muted-foreground">{formatValue(token.valueUSD)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* No Results */}
      {!loading && searchAddress && !hasTokens && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <WalletIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Tokens Found</h3>
            <p className="text-muted-foreground mb-4">
              No tokens were discovered for this address on the {selectedNetwork} network.
            </p>
            <p className="text-sm text-muted-foreground">
              This could mean the wallet has no token balances, or the address might be invalid.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}