'use client'

import { useEffect, useState } from 'react'
import { useTurnkeyWallet } from '@/hooks/use-turnkey-wallet'
import { useUnifiedTurnkey } from '@/hooks/use-unified-turnkey'
import { ArrowDownIcon, ArrowUpIcon, LoaderIcon, ExternalLink } from 'lucide-react'
import { formatEther } from 'viem'
import { formatTokenBalanceMobile } from '@/lib/token-utils'
import { NumberModal } from '@/components/ui/number-modal'

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
import { API_ENDPOINTS, EXPLORER_URLS, API_CONFIG } from '@/lib/constants/api-endpoints'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  status: 'confirmed' | 'pending' | 'failed'
  timestamp: number
  blockNumber?: number
  tokenInfo?: {
    symbol: string
    decimals: number
    name: string
    address: string
  }
  type?: 'TRX' | 'TRC20' | 'ETH' | 'ERC20'
}

// Network-aware pricing handled by NETWORK_CONFIGS

interface TurnkeyActivityProps {
  className?: string
  selectedNetwork?: 'tron' | 'ethereum' | 'celo'
}

// Fetch transactions based on network type
async function fetchTransactions(address: string, networkId: string): Promise<Transaction[]> {
  try {
    
    if (networkId === 'tron') {
      // Fetch both TRX transactions and TRC20 token transfers
      const [trxResponse, trc20Response] = await Promise.all([
        fetch(API_ENDPOINTS.TRON.NILE_TESTNET.TRANSACTIONS(address), {
          method: 'GET',
          headers: API_CONFIG.DEFAULT_HEADERS,
        }),
        fetch(API_ENDPOINTS.TRON.NILE_TESTNET.TRC20_TRANSACTIONS(address), {
          method: 'GET',
          headers: API_CONFIG.DEFAULT_HEADERS,
        })
      ])
      
      const transactions: Transaction[] = []
      
      // Process TRC20 token transfers (more important for wallet activity)
      if (trc20Response.ok) {
        const trc20Data = await trc20Response.json()
        
        if (trc20Data.data && trc20Data.data.length > 0) {
          const trc20Transactions = trc20Data.data.slice(0, 10).map((tx: any) => ({
            hash: tx.transaction_id,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            status: 'confirmed' as const,
            timestamp: Math.floor(tx.block_timestamp / 1000),
            tokenInfo: {
              symbol: tx.token_info.symbol,
              decimals: tx.token_info.decimals,
              name: tx.token_info.name,
              address: tx.token_info.address,
            },
            type: 'TRC20' as const
          }))
          transactions.push(...trc20Transactions)
        }
      }
      
      // Process TRX transactions
      if (trxResponse.ok) {
        const trxData = await trxResponse.json()
        
        if (trxData.data && trxData.data.length > 0) {
          const trxTransactions = trxData.data.slice(0, 5).map((tx: any) => {
            // Parse TRON transaction
            const contract = tx.raw_data?.contract?.[0]
            const value = contract?.parameter?.value
            const contractType = contract?.type
            
            // Handle different contract types
            let fromAddress = address
            let toAddress = address  
            let amount = '0'
            
            if (contractType === 'TransferContract' && value) {
              fromAddress = value.owner_address || address
              toAddress = value.to_address || address
              amount = value.amount ? value.amount.toString() : '0'
            } else if (contractType === 'TriggerSmartContract' && value) {
              fromAddress = value.owner_address || address
              toAddress = value.contract_address || address
              // For smart contract calls, amount might be in callValue
              amount = value.call_value ? value.call_value.toString() : '0'
            }
            
            return {
              hash: tx.txID,
              from: fromAddress,
              to: toAddress,
              value: amount,
              status: tx.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed',
              timestamp: Math.floor(tx.block_timestamp / 1000),
              blockNumber: tx.blockNumber,
              type: 'TRX' as const
            }
          })
          transactions.push(...trxTransactions)
        }
      }
      
      // Sort all transactions by timestamp (most recent first)
      return transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    } else if (networkId === 'ethereum') {
      // Use Etherscan API for Sepolia testnet
      const response = await fetch(
        `${API_ENDPOINTS.ETHEREUM.SEPOLIA_TESTNET.ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=demo`
      )
      
      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.result && data.result.length > 0) {
        return data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
          timestamp: parseInt(tx.timeStamp),
          blockNumber: parseInt(tx.blockNumber),
          type: 'ETH' as const
        }))
      }
    } else if (networkId === 'celo') {
      // Use Celo explorer API for Alfajores testnet
      const response = await fetch(
        `${API_ENDPOINTS.CELO.ALFAJORES_TESTNET.CELOSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
      )
      
      if (!response.ok) {
        throw new Error(`Celo API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🔍 Celo API response:', data)
      
      if (data.result && data.result.length > 0) {
        return data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
          timestamp: parseInt(tx.timeStamp),
          blockNumber: parseInt(tx.blockNumber),
          type: 'CELO' as const
        }))
      }
    }
    
    return []
  } catch (error) {
    console.warn('Failed to fetch transactions:', error)
    return []
  }
}

// Helper function to convert TRON hex address to base58
function convertTronAddress(hexAddress: string): string {
  // For now, return the original - in production you'd use tronweb
  // This is a simplified approach for the demo
  if (hexAddress.startsWith('0x')) {
    return hexAddress
  }
  return hexAddress
}

export function TurnkeyActivity({ className, selectedNetwork }: TurnkeyActivityProps) {
  const { loading: walletLoading, walletInfo, prices } = useTurnkeyWallet(selectedNetwork)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    const loadTransactions = async () => {
      if (!walletInfo?.address || !walletInfo?.networkConfig) return

      setTransactionsLoading(true)
      try {
        const txs = await fetchTransactions(walletInfo.address, walletInfo.networkConfig.id)
        setTransactions(txs)
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    loadTransactions()
  }, [walletInfo?.address, walletInfo?.networkConfig?.id])

  const handleViewOnExplorer = (hash: string) => {
    if (!walletInfo?.networkConfig) return
    const networkId = walletInfo.networkConfig.id as keyof typeof EXPLORER_URLS.TRANSACTION
    const explorerUrl = EXPLORER_URLS.TRANSACTION[networkId]?.(hash) || `${walletInfo.networkConfig.explorerUrl.replace('/address/', '/tx/')}${hash}`
    window.open(explorerUrl, '_blank', 'noopener,noreferrer')
  }

  const handleViewAddressOnExplorer = (address: string) => {
    if (!walletInfo?.networkConfig) return
    const networkId = walletInfo.networkConfig.id as keyof typeof EXPLORER_URLS.ADDRESS
    const explorerUrl = EXPLORER_URLS.ADDRESS[networkId]?.(address) || `${walletInfo.networkConfig.explorerUrl}${address}`
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
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="text-lg sm:text-2xl">Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <ScrollArea className="flex max-h-[450px] w-full flex-col overflow-y-auto overflow-x-hidden rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Date</TableHead>
                <TableHead className="text-xs sm:text-sm">From</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">To</TableHead>
                <TableHead className="text-xs sm:text-sm">Amount</TableHead>
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
                    <TableCell className="p-1 sm:p-4">
                      <button
                        onClick={() => handleViewOnExplorer(transaction.hash)}
                        className="flex items-center gap-1 sm:gap-2 capitalize text-xs sm:text-sm"
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="hidden sm:inline">{transaction.status}</span>
                      </button>
                    </TableCell>
                    <TableCell className="hidden p-1 text-xs sm:table-cell md:p-4 md:text-sm">
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell className="p-1 sm:p-4 font-mono text-xs">
                      <button
                        className="underline underline-offset-4"
                        onClick={() => handleViewAddressOnExplorer(transaction.from)}
                      >
                        {formatAddress(transaction.from)}
                      </button>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">
                      <button
                        className="underline underline-offset-4"
                        onClick={() => handleViewAddressOnExplorer(transaction.to)}
                      >
                        {formatAddress(transaction.to)}
                      </button>
                    </TableCell>
                    <TableCell className="p-1 sm:p-4">
                      {(() => {
                        const getFormattedValue = () => {
                          if (!transaction.value || transaction.value === '0') return '0'
                          
                          // Handle different transaction types
                          if (transaction.type === 'TRC20' && transaction.tokenInfo) {
                            // TRC20 token transaction
                            const value = parseFloat(transaction.value) / Math.pow(10, transaction.tokenInfo.decimals)
                            return value.toFixed(transaction.tokenInfo.decimals <= 6 ? transaction.tokenInfo.decimals : 6)
                          } else if (walletInfo?.networkConfig?.id === 'tron') {
                            // TRON TRX uses SUN (6 decimals)
                            const value = parseFloat(transaction.value) / Math.pow(10, 6)
                            return value.toFixed(6)
                          } else {
                            // Ethereum/CELO use wei (18 decimals)
                            return formatEther(BigInt(transaction.value))
                          }
                        }
                        
                        const fullValue = getFormattedValue()
                        const mobileValue = formatTokenBalanceMobile(fullValue, 6)
                        const symbol = transaction.tokenInfo?.symbol || walletInfo?.networkConfig?.symbol || 'TOKEN'
                        
                        return (
                          <NumberModal 
                            fullNumber={fullValue}
                            label="Transaction Amount"
                            symbol={symbol}
                          >
                            <div className="font-medium text-xs sm:text-sm">
                              {/* Desktop: Show full precision, Mobile: Show shortened */}
                              <span className="hidden sm:inline">
                                {fullValue}
                              </span>
                              <span className="sm:hidden">
                                {mobileValue}
                              </span>
                              {' '}
                              <span className="text-xs text-muted-foreground">
                                {symbol}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              $
                              {(() => {
                                if (!transaction.value || !walletInfo?.networkConfig || !prices) return '0'
                                
                                let tokenAmount = 0
                                if (walletInfo.networkConfig.id === 'tron') {
                                  tokenAmount = parseFloat(transaction.value) / Math.pow(10, 6)
                                } else {
                                  tokenAmount = parseFloat(formatEther(BigInt(transaction.value)))
                                }
                                
                                const currentPrice = prices[walletInfo.networkConfig.id] || 0
                                return (tokenAmount * currentPrice).toFixed(2)
                              })()}
                            </div>
                          </NumberModal>
                        )
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        No activity yet. Send or receive {walletInfo?.networkConfig?.symbol || 'tokens'} to see transactions here.
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