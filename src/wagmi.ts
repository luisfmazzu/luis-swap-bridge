import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = 'demo-project-id' // In production, use a real WalletConnect project ID

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Decentralized Tipping Platform',
        description: 'Send crypto tips to creators on Sepolia testnet',
        url: 'https://tip-crypto.vercel.app',
        icons: ['./icon-192x192.png']
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})