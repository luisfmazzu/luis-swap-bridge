'use client'

import { useEffect, useState } from 'react'
import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { ArrowDownIcon, ArrowUpIcon, LoaderIcon, ExternalLink } from 'lucide-react'
import { formatEther } from 'viem'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  status: 'confirmed' | 'pending' | 'failed'
  timestamp: number
  blockNumber?: number
}

// Mock ETH price - in production you'd use a real price feed
const MOCK_ETH_PRICE = 3500

interface TurnkeyActivityProps {
  className?: string
}

// Mock function to fetch transactions - in production you'd use Alchemy or similar
async function fetchTransactions(address: string): Promise<Transaction[]> {
  try {
    // Using a public API to get transaction history
    // In production, you'd use Alchemy, Etherscan API, or similar
    console.log('🔍 Fetching transactions for address:', address)
    
    // For now, return empty array since we need proper API setup
    // In the demo, they have Alchemy SDK configured
    return []
  } catch (error) {
    console.warn('Failed to fetch transactions:', error)
    return []
  }
}

export function TurnkeyActivity({ className }: TurnkeyActivityProps) {
  const { loading: walletLoading, walletInfo } = useTurnkeyWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      if (!walletInfo?.address) return

      setTransactionsLoading(true)
      try {
        const txs = await fetchTransactions(walletInfo.address)
        setTransactions(txs)
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    loadTransactions()
  }, [walletInfo?.address])

  const handleViewOnExplorer = (hash: string) => {
    const explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const handleViewAddressOnExplorer = (address: string) => {
    const explorerUrl = `https://sepolia.etherscan.io/address/${address}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />
      case 'pending':
        return <LoaderIcon className="h-4 w-4 animate-spin text-yellow-500" />
      case 'failed':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />
      default:
        return <ArrowDownIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg sm:text-2xl">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="flex max-h-[450px] w-full flex-col overflow-y-auto rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead className="hidden sm:table-cell">To</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {walletLoading || transactionsLoading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length > 0 ? (
                // Transactions list
                transactions.map((transaction) => (
                  <TableRow key={transaction.hash}>
                    <TableCell>
                      <button
                        onClick={() => handleViewOnExplorer(transaction.hash)}
                        className="flex items-center gap-2 capitalize hover:text-foreground/80 transition-colors"
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </button>
                    </TableCell>
                    <TableCell className="hidden p-1 text-xs sm:table-cell md:p-4 md:text-sm">
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <button
                        className="hover:text-foreground/80 transition-colors underline underline-offset-4"
                        onClick={() => handleViewAddressOnExplorer(transaction.from)}
                      >
                        {formatAddress(transaction.from)}
                      </button>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">
                      <button
                        className="hover:text-foreground/80 transition-colors underline underline-offset-4"
                        onClick={() => handleViewAddressOnExplorer(transaction.to)}
                      >
                        {formatAddress(transaction.to)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {transaction.value ? formatEther(BigInt(transaction.value)) : '0'}{' '}
                        <span className="text-xs text-muted-foreground">ETH</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        $
                        {transaction.value
                          ? (
                              parseFloat(formatEther(BigInt(transaction.value))) *
                              MOCK_ETH_PRICE
                            ).toFixed(2)
                          : '0'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        No activity yet. Send or receive ETH to see transactions here.
                      </p>
                      {walletInfo?.address && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAddressOnExplorer(walletInfo.address)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Explorer
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}