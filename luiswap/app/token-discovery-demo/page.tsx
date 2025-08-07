'use client'

import { EnhancedTokenDiscovery } from '@/components/wallet/enhanced-token-discovery'

export default function TokenDiscoveryDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Token Discovery System Demo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test our enhanced token discovery system that can automatically identify tokens 
            in any wallet across multiple networks (Ethereum, Celo, TRON) using various 
            discovery methods including Alchemy API, direct contract calls, and transaction history analysis.
          </p>
        </div>

        <EnhancedTokenDiscovery
          defaultAddress=""
          defaultNetwork="ethereum"
        />
        
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Addresses (Testnets)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-600 mb-2">Ethereum Sepolia</h3>
              <code className="text-xs bg-background p-2 rounded block">
                0x742d35Cc6641C2F7FE75C2E4dE7Bc3C5f95b4EDB
              </code>
            </div>
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Celo Alfajores</h3>
              <code className="text-xs bg-background p-2 rounded block">
                0x742d35Cc6641C2F7FE75C2E4dE7Bc3C5f95b4EDB
              </code>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">TRON Nile</h3>
              <code className="text-xs bg-background p-2 rounded block">
                TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs
              </code>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">Discovery Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <h3 className="font-medium mb-2">🟢 Native Token Discovery</h3>
              <p>Direct RPC calls to get native token balances (ETH, CELO, TRX)</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🔵 Alchemy API Discovery</h3>
              <p>Advanced token discovery for Ethereum & Celo networks</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🟣 API-Based Discovery</h3>
              <p>Network-specific APIs (TronGrid for TRON tokens)</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">🟠 Contract Discovery</h3>
              <p>Direct contract calls to fetch token metadata</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}