# LuiSwap - Multi-Chain DEX Platform

A modern, production-ready decentralized exchange (DEX) platform supporting multi-chain token swapping, cross-chain bridging, and portfolio management. Built with Next.js, TypeScript, Wagmi, and Turnkey for seamless Web3 integration across 6 major blockchains.

## 🎯 Project Goal

LuiSwap provides users with a comprehensive DeFi platform for trading, bridging, and managing digital assets across multiple blockchain networks. By leveraging cutting-edge Web3 technologies and embedded wallet solutions, users can access optimal trading routes, cross-chain transfers, and real-time portfolio tracking in a single, professional interface.

### Key Features

- **Multi-Chain Trading**: Swap tokens across Ethereum, Polygon, BSC, Arbitrum, Optimism, and Avalanche
- **Cross-Chain Bridging**: Seamless asset transfers between blockchains via Stargate Finance
- **Portfolio Management**: Real-time multi-chain balance tracking with USD valuations
- **Embedded Wallets**: Turnkey-powered wallet integration for seamless user onboarding
- **Live Monitoring**: Real-time transaction feeds and network statistics
- **Professional UI/UX**: Mobile-responsive design with sophisticated animations

## 🛠️ Technologies & Techniques

### Frontend Framework
- **Next.js 15** with App Router for production-ready React applications
- **TypeScript** for type-safe development across the entire stack
- **React 18** with Server Components for optimal performance

### Web3 Integration
- **Wagmi v2** - Comprehensive React hooks for multi-chain Web3 development
- **Viem** - Type-safe Ethereum library for transaction handling and contract interactions
- **Turnkey SDK** - Embedded wallet infrastructure for seamless user onboarding
- **1inch API** - DEX aggregation for optimal swap routes and pricing
- **Stargate Finance** - Cross-chain bridging protocol integration

### UI/UX Technologies
- **Tailwind CSS** for utility-first styling
- **ShadCN/UI** for accessible, customizable components
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent iconography
- **React Toastify** for user notifications

### State Management & Data
- **TanStack Query (React Query)** for advanced data fetching, caching, and synchronization
- **React Hooks** for component-level state management
- **Custom Web3 Hooks** for specialized blockchain operations and real-time updates
- **Local Storage** persistence for user preferences and session data

### Development Tools
- **TypeScript** for static type checking
- **ESLint** and **Prettier** for code quality
- **PostCSS** with Tailwind for CSS processing

## 🔗 Wagmi Integration

This project demonstrates comprehensive use of Wagmi v2's React hooks and utilities for multi-chain Web3 development. Wagmi provides type-safe, efficient hooks for:

- **Multi-Chain Wallet Management**: Support for MetaMask, WalletConnect, Coinbase Wallet across 6 blockchains
- **Cross-Chain Account Management**: Unified account data and authentication across networks
- **Transaction Handling**: Multi-chain transaction execution with real-time status tracking
- **Token Balance Queries**: Real-time balance monitoring across all supported chains
- **Gas Fee Optimization**: Dynamic gas price monitoring and transaction cost estimation
- **Network Switching**: Seamless chain switching and configuration management
- **Contract Interactions**: ERC20 token approvals, transfers, and smart contract calls

For detailed implementation specifics, including exact hook usage, parameters, and code locations, see [Wagmi_Implementation.md](./Wagmi_Implementation.md).

## 🔐 Turnkey Integration

This project leverages Turnkey's embedded wallet infrastructure for seamless user onboarding and wallet management:

- **Embedded Wallet Creation**: Programmatic wallet generation without seed phrases
- **Secure Key Management**: Hardware-grade security with distributed key generation
- **Seamless User Experience**: Email-based authentication with instant wallet access
- **Multi-Chain Support**: Single wallet interface across all supported blockchains
- **Developer-Friendly APIs**: Simple integration with existing Web3 applications
- **Enterprise Security**: SOC 2 Type 2 certified infrastructure with institutional-grade security

Key implementations include passwordless authentication, automatic wallet provisioning, cross-chain transaction signing, and secure key recovery mechanisms.

Turnkey enables users to interact with DeFi protocols without complex wallet setup, making Web3 accessible to mainstream users while maintaining the security and decentralization principles of blockchain technology.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- MetaMask, WalletConnect, or compatible Web3 wallet
- Turnkey API keys (for embedded wallet functionality)
- Test tokens across supported networks

### Installation

1. Clone the repository:
```bash
git clone https://github.com/luisfmazzu/luis-swap-bridge.git
cd luis-swap-bridge/luiswap
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Add your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
luiswap/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page with DEX preview
│   ├── swap/              # Token swapping interface
│   ├── bridge/            # Cross-chain bridging
│   ├── explore/           # Portfolio dashboard
│   ├── live-events/       # Real-time transaction monitoring
│   └── layout.tsx         # Root layout with Web3 providers
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN base components
│   ├── wallet/           # Wallet connection components
│   ├── swap/             # Trading interface components
│   ├── bridge/           # Bridging components
│   ├── portfolio/        # Portfolio management
│   └── live-events/      # Real-time monitoring
├── lib/                  # Core libraries and utilities
│   ├── wagmi-config.ts   # Multi-chain Wagmi configuration
│   ├── turnkey-config.ts # Embedded wallet setup
│   ├── constants/        # Token lists and chain configs
│   └── api/              # External API integrations
├── hooks/                # Custom React hooks
│   ├── use-token-balance.ts  # Balance tracking
│   ├── use-swap.ts          # Swap functionality
│   ├── use-bridge.ts        # Cross-chain operations
│   ├── use-portfolio.ts     # Portfolio management
│   └── use-live-events.ts   # Real-time monitoring
├── providers/            # React context providers
└── types/               # TypeScript definitions
```

## 🌐 Application Features

1. **Landing Page**: Modern hero section with integrated DEX preview and multi-chain statistics
2. **Swap Interface**: Professional trading interface with real-time quotes and slippage protection
3. **Cross-Chain Bridge**: Seamless asset transfers with multiple route options and fee comparison
4. **Portfolio Dashboard**: Comprehensive multi-chain balance tracking with USD valuations
5. **Live Events**: Real-time transaction monitoring with advanced filtering and analytics
6. **Responsive Design**: Mobile-first design optimized for all device sizes

## 🧪 Testing

The application supports testing across multiple networks:
- **Mainnets**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche
- **Testnets**: Configure additional testnets as needed
- **Embedded Wallets**: Test Turnkey integration with email authentication
- **DEX Functionality**: Use test tokens or small amounts for swap testing
- **Bridge Operations**: Test cross-chain transfers with minimal amounts

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🔐 Security Considerations

- All transactions occur on-chain with full transparency across multiple blockchains
- Private keys managed securely through Turnkey's distributed infrastructure
- Smart contract interactions include token approvals, swaps, and cross-chain operations
- Multi-signature and hardware-grade security for embedded wallets
- Production-ready security practices with comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wagmi](https://wagmi.sh/) for excellent multi-chain Web3 React hooks
- [Turnkey](https://www.turnkey.com/) for embedded wallet infrastructure and security
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful, accessible components
- [Viem](https://viem.sh/) for type-safe Ethereum utilities
- [1inch](https://1inch.io/) for DEX aggregation and optimal swap routing
- [Stargate Finance](https://stargate.finance/) for cross-chain bridging protocol
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations