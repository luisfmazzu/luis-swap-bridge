'use client'

import { useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTurnkey } from '@/contexts/turnkey-context'

export function TestTurnkey() {
  const [status, setStatus] = useState<string>('')
  const { connect, connectors, isPending } = useConnect()
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const {
    turnkey,
    isInitialized,
    isConnecting,
    error,
    wallets,
    activeWallet,
    initializeTurnkey,
    createWallet,
    refreshWallets,
  } = useTurnkey()

  const turnkeyConnector = connectors.find(c => c.id === 'turnkey')

  const handleTurnkeyConnect = async () => {
    if (!turnkeyConnector) {
      setStatus('Turnkey connector not found')
      return
    }

    setStatus('Connecting to Turnkey...')
    try {
      await connect({ connector: turnkeyConnector })
      setStatus('Connected successfully!')
    } catch (err) {
      setStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCreateWallet = async () => {
    setStatus('Creating wallet...')
    try {
      const wallet = await createWallet(`Test Wallet ${Date.now()}`)
      if (wallet) {
        setStatus(`Wallet created: ${wallet.walletName}`)
        await refreshWallets()
      } else {
        setStatus('Failed to create wallet')
      }
    } catch (err) {
      setStatus(`Wallet creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Turnkey Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Turnkey Initialized:</strong> {isInitialized ? '✅' : '❌'}
          </p>
          <p className="text-sm">
            <strong>Connector Available:</strong> {turnkeyConnector ? '✅' : '❌'}
          </p>
          <p className="text-sm">
            <strong>Connected:</strong> {isConnected ? '✅' : '❌'}
          </p>
          <p className="text-sm">
            <strong>Address:</strong> {address || 'None'}
          </p>
          <p className="text-sm">
            <strong>Connector ID:</strong> {connector?.id || 'None'}
          </p>
          <p className="text-sm">
            <strong>Wallets Count:</strong> {wallets.length}
          </p>
          <p className="text-sm">
            <strong>Active Wallet:</strong> {activeWallet?.walletName || 'None'}
          </p>
        </div>

        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        {status && (
          <div className="p-2 bg-blue-100 border border-blue-300 rounded text-blue-700 text-sm">
            Status: {status}
          </div>
        )}

        <div className="space-y-2">
          {!isInitialized && (
            <Button 
              onClick={initializeTurnkey} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? 'Initializing...' : 'Initialize Turnkey'}
            </Button>
          )}

          {!isConnected && turnkeyConnector && (
            <Button 
              onClick={handleTurnkeyConnect} 
              disabled={isPending}
              className="w-full"
            >
              {isPending ? 'Connecting...' : 'Connect Turnkey'}
            </Button>
          )}

          {isConnected && (
            <Button 
              onClick={() => disconnect()} 
              variant="outline"
              className="w-full"
            >
              Disconnect
            </Button>
          )}

          {isInitialized && (
            <Button 
              onClick={handleCreateWallet} 
              disabled={isConnecting}
              variant="secondary"
              className="w-full"
            >
              {isConnecting ? 'Creating...' : 'Create Test Wallet'}
            </Button>
          )}

          {isInitialized && (
            <Button 
              onClick={refreshWallets} 
              disabled={isConnecting}
              variant="outline"
              className="w-full"
            >
              Refresh Wallets
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>Available Connectors:</p>
          <ul>
            {connectors.map(connector => (
              <li key={connector.id}>
                {connector.name} ({connector.id})
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}