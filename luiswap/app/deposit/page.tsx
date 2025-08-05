'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Coins, Wallet, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { useWeb3 } from '@/hooks/use-web3'
import { DynamicConnectionManager } from '@/components/web3/dynamic-connection-manager'
import { PageHeader } from "@/components/page-header"
import { PageFooter } from "@/components/page-footer"

export default function DepositPage() {
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositStatus, setDepositStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>('')
  
  const {
    address,
    isConnected,
    chainId,
    currentChain,
    isChainSupported,
  } = useWeb3()

  // Check if connected to Tron network (chain ID 728 for mainnet, 2494104990 for Shasta testnet)
  const isTronNetwork = chainId === 728 || chainId === 2494104990
  
  const handleDeposit = async () => {
    if (!address || !isTronNetwork) return
    
    setIsDepositing(true)
    setDepositStatus('idle')
    
    try {
      // Call TronGrid API for testnet USDT deposit
      const response = await fetch('/api/deposit/tron-usdt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          network: chainId === 728 ? 'mainnet' : 'testnet'
        }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDepositStatus('success')
        setTxHash(result.txHash || '')
      } else {
        setDepositStatus('error')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      setDepositStatus('error')
    } finally {
      setIsDepositing(false)
    }
  }

  const getExplorerUrl = () => {
    if (!txHash) return ''
    const baseUrl = chainId === 728 
      ? 'https://tronscan.org/#/transaction/' 
      : 'https://shasta.tronscan.org/#/transaction/'
    return `${baseUrl}${txHash}`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#141621" }}>
      <PageHeader />
      <main className="flex-1" style={{ backgroundColor: "#151826" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">USDT Deposit</h1>
            <p className="text-muted-foreground">
              Deposit USDT testnet tokens to your Tron wallet address
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Tron USDT Testnet Faucet
              </CardTitle>
              <CardDescription>
                Get free USDT testnet tokens for development and testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Connection Status */}
              {!isConnected ? (
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet to proceed with the deposit.
                  </AlertDescription>
                </Alert>
              ) : !isTronNetwork ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please switch to Tron network to use this feature. Currently connected to {currentChain?.name || 'Unknown network'}.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Wallet connected to {chainId === 728 ? 'Tron Mainnet' : 'Tron Shasta Testnet'}. Ready to deposit.
                  </AlertDescription>
                </Alert>
              )}

              {/* Network Badge */}
              {isConnected && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <Badge 
                    variant={isTronNetwork ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isTronNetwork 
                      ? (chainId === 728 ? 'Tron Mainnet' : 'Tron Shasta Testnet')
                      : 'Unsupported Network'
                    }
                  </Badge>
                </div>
              )}

              {/* Address Display */}
              {isConnected && address && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Recipient Address</label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-mono text-sm break-all">{address}</span>
                  </div>
                </div>
              )}

              {/* Deposit Information */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium text-foreground">Deposit Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token:</span>
                    <span>USDT (TRC-20)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>100 USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span>Tron {chainId === 728 ? 'Mainnet' : 'Testnet'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                {!isConnected ? (
                  <DynamicConnectionManager 
                    className="w-full"
                    variant="default"
                  />
                ) : (
                  <Button
                    onClick={handleDeposit}
                    disabled={!isTronNetwork || isDepositing}
                    className="w-full"
                    size="lg"
                  >
                    {isDepositing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Deposit...
                      </>
                    ) : (
                      <>
                        <Coins className="h-4 w-4 mr-2" />
                        Request USDT Deposit
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Status Messages */}
              {depositStatus === 'success' && (
                <Alert className="border-green-500/20 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Deposit successful! USDT tokens have been sent to your wallet.
                    {txHash && (
                      <div className="mt-2">
                        <a
                          href={getExplorerUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-400 hover:text-green-300 underline"
                        >
                          View transaction <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {depositStatus === 'error' && (
                <Alert className="border-red-500/20 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Deposit failed. Please try again or check your wallet connection.
                  </AlertDescription>
                </Alert>
              )}

              {/* Important Notes */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong>Note:</strong> This is for testnet tokens only and has no real value.</p>
                <p>Rate limit: 1 request per address per 24 hours.</p>
                <p>If you encounter issues, ensure your wallet supports Tron network.</p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  )
}