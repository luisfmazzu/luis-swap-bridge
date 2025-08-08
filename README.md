# LuiSwap - Multi-Chain DEX Platform

A modern decentralized exchange (DEX) platform frontend with beautiful UI/UX design for multi-chain token swapping, cross-chain bridging, and portfolio management. Built with Next.js, TypeScript, and modern web technologies with responsive design across all devices.

## 🏆 Turnkey Challenge

### ✅ Completed Features

- **🔐 Turnkey Authentication System**
  - Passkey-based authentication for secure, passwordless login
  - Email-based authentication with OTP verification
  - Seamless wallet creation and management
  - Multi-network support (Ethereum, Tron, Celo)

- **💰 Portfolio Management (Explore Page)**
  - Real-time asset portfolio tracking
  - Token balance display with USD values
  - Transaction history and activity monitoring
  - Network-specific wallet information
  - Mobile-optimized card layouts for screens ≤450px

- **🌉 Bridge Interface (Mock Implementation)**
  - Cross-chain token bridge simulation
  - Loading animations and success notifications
  - User-friendly transfer interface

- **📱 Mobile Responsiveness**
  - Card-based interfaces for small screens
  - Responsive navigation and components
  - Touch-friendly interactions

- **✨ Enhanced User Experience**
  - Input validation for numeric fields
  - Smooth animations and loading states
  - Error handling and user feedback
  - Clean, modern UI with Tailwind CSS

### 📋 Todo List

##### State Management
- [ ] **Zustand Implementation**
  - Replace context-based state with Zustand stores
  - Persistent state management
  - Improved performance with selective subscriptions
  - Type-safe store definitions

#### Turnkey Integration Enhancements
- [ ] **OAuth Methods Implementation**
  - Google OAuth integration
  - Apple Sign In integration  
  - Facebook Login integration
  - Social login state management

- [ ] **Bridge Functionality**
  - Real cross-chain bridge implementation
  - Multiple bridge provider integration
  - Transaction status tracking
  - Gas optimization for bridge transactions

#### MiniPay Integration
- [ ] **Celo MiniPay Support**
  - MiniPay wallet detection and integration
  - Celo network optimization
  - Mobile-first transaction flow
  - USDC/cUSD native support

#### Advanced Features & Improvements

##### Performance Optimizations
- [ ] **Lazy Loading**
  - Component-level code splitting
  - Dynamic imports for heavy components
  - Route-based lazy loading
  - Image lazy loading optimization

- [ ] **Advanced Techniques**
  - React Query for data fetching and caching
  - Virtual scrolling for large lists
  - Service Worker for offline functionality
  - Bundle size optimization

##### Developer Experience
- [ ] **Testing & Quality**
  - Unit tests with Jest/Vitest
  - E2E tests with Playwright
  - Component testing with Testing Library
  - Performance monitoring integration

## 🚧 Current Implementation Status

**Frontend Complete**: The entire user interface and responsive design have been implemented and are fully functional, including all Turnkey Challenge features above, plus:
- Landing page with modern hero section and network statistics
- Complete swap interface with professional trading UI  
- Cross-chain bridge interface with route selection
- Portfolio dashboard with multi-chain balance displays
- Live events monitoring with real-time transaction feeds
- Mobile-responsive design optimized for all screen sizes
- Modern animations and interactive components
- Wagmi Integration: Web3 wallet connections and blockchain interactions
- **Turnkey Integration**: Embedded wallet with passkey authentication and multi-chain support

**Next Steps - Backend Integrations**: The following integrations are planned for future development:
- **DEX Operations**: 1inch API integration for actual token swapping
- **Cross-chain Bridging**: Stargate Finance protocol integration
- **Real-time Data**: Live blockchain data feeds and transaction monitoring

## 🎯 Project Goal

LuiSwap aims to provide users with a comprehensive DeFi platform for trading, bridging, and managing digital assets across multiple blockchain networks. The current implementation focuses on delivering a beautiful, responsive frontend with professional UI/UX design.

### Current Features (Frontend)

- **Modern Landing Page**: Hero section with network statistics and DEX preview
- **Swap Interface**: Professional trading UI with token selection and swap configuration
- **Bridge Interface**: Cross-chain transfer UI with route selection and fee displays  
- **Portfolio Dashboard**: Multi-chain balance displays and portfolio management
- **Live Events**: Transaction monitoring interface with filtering capabilities
- **Responsive Design**: Mobile-first design optimized for all screen sizes
- **Professional Animations**: Smooth transitions and interactive components using Framer Motion
- **Turnkey Embedded Wallet**: Passkey authentication, Google OAuth, and multi-chain support (TRON, Ethereum, Celo)
- **Token Discovery**: Automatic balance detection across multiple networks with USD pricing

## 🛠️ Technologies & Techniques

### Frontend Framework (Implemented)
- **Next.js 15** with App Router for modern React applications
- **TypeScript** for type-safe development and better code quality
- **React 18** with modern hooks and component patterns

### UI/UX Technologies (Implemented)
- **Tailwind CSS v4** for utility-first styling and responsive design
- **ShadCN/UI** for accessible, customizable component library
- **Framer Motion** for smooth animations and interactive transitions
- **Lucide React** for consistent iconography throughout the app
- **@web3icons/react** for blockchain network and token icons

### State Management (Implemented)
- **React Hooks** (useState, useEffect) for component-level state management
- **Custom Hooks** for reusable logic and component patterns
- **Context API** for theme management and global state

### Development Tools (Implemented)
- **TypeScript** for static type checking and better development experience
- **PostCSS** with Tailwind for CSS processing and optimization
- **Next.js built-in optimizations** for performance and SEO

### Current Integrations (Implemented)
- **Wagmi v2** - React hooks for multi-chain Web3 development
- **Viem** - Type-safe Ethereum library for blockchain interactions  
- **Turnkey SDK** - Embedded wallet infrastructure with passkey authentication
- **TanStack Query** - Advanced data fetching and caching

### Future Integrations (Planned)
- **1inch API** - DEX aggregation for optimal trading routes
- **Stargate Finance** - Cross-chain bridging protocol
- **Enhanced DEX Features** - Advanced trading tools and analytics

## 🔮 Implemented Integrations

### Wagmi Integration (Implemented)
The project uses Wagmi v2's React hooks for multi-chain Web3 development:
- Multi-chain wallet management and authentication
- Real-time transaction handling and status tracking  
- Token balance queries across supported networks
- Gas fee optimization and network switching
- ERC20 contract interactions and approvals

### Turnkey Integration (Implemented)
Embedded wallet infrastructure providing seamless user experience:
- Passkey authentication without seed phrases
- Google OAuth integration for social login
- Hardware-grade security with distributed key management
- Multi-chain support (TRON, Ethereum, Celo) through single wallet interface
- Seamless user onboarding for mainstream adoption
- Automatic token discovery and balance tracking across networks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/luisfmazzu/luis-swap-bridge.git
cd luis-swap-bridge/luiswap
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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
- **Testnets**: TRON Nile, Ethereum Sepolia, Celo Alfajores
- **Embedded Wallets**: Test Turnkey integration with passkey and Google OAuth authentication
- **DEX Functionality**: Use test tokens or small amounts for swap testing
- **Bridge Operations**: Test cross-chain transfers with minimal amounts

### Demo Project (Local Only)

A `demo-embedded-wallet` project exists locally for Turnkey SDK reference and testing purposes. This directory is intentionally excluded from version control to keep the repository focused on the main application. The demo serves as a reference implementation for Turnkey's embedded wallet features.

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

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luisfmazzu/luis-swap-bridge.git
   cd luis-swap-bridge/luiswap
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Environment Variables**
   
   Create a `.env.local` file in the luiswap directory:
   
   ```env
   # Turnkey Configuration
   NEXT_PUBLIC_TURNKEY_API_BASE_URL=https://api.turnkey.com
   NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your_org_id
   TURNKEY_API_PRIVATE_KEY=your_private_key
   TURNKEY_API_PUBLIC_KEY=your_public_key
   
   # OAuth Configuration (when implemented)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # API Keys for price data and bridge services
   NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key
   NEXT_PUBLIC_1INCH_API_KEY=your_api_key
   
   # Network RPC URLs (optional - falls back to defaults)
   NEXT_PUBLIC_ETHEREUM_RPC_URL=your_ethereum_rpc
   NEXT_PUBLIC_TRON_RPC_URL=your_tron_rpc
   NEXT_PUBLIC_CELO_RPC_URL=your_celo_rpc
   ```

4. **Turnkey Organization Setup**
   
   Follow the [Turnkey documentation](https://docs.turnkey.com) to:
   - Create a Turnkey organization
   - Generate API keys
   - Configure allowed origins for your domain

### Development

1. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Key Features & Usage

#### 🔐 Authentication
- Visit any protected page to see the Turnkey authentication modal
- Choose between Passkey or Email authentication
- Passkeys provide the most secure, passwordless experience

#### 💱 Token Swapping
- Navigate to `/swap`
- Connect your wallet or authenticate with Turnkey
- Select tokens and enter amounts
- Execute swaps with real-time price quotes

#### 🌉 Cross-Chain Bridging
- Navigate to `/bridge`
- Select source and destination networks
- Enter token amounts for cross-chain transfers
- Currently in mock mode with realistic UI/UX

#### 📊 Portfolio Tracking
- Navigate to `/explore` after authentication
- View real-time token balances and USD values
- Monitor transaction history
- Switch between different networks

### Troubleshooting

#### Common Issues

1. **Build errors related to environment variables**
   - Ensure all required environment variables are set
   - Check that Turnkey credentials are valid

2. **Wallet connection issues**
   - Verify network configurations in `lib/constants/chains.ts`
   - Check browser console for Web3 errors

3. **Mobile responsiveness issues**
   - The app is optimized for screens ≥375px wide
   - Test on actual devices for best results

#### Getting Help

- Check the browser console for error messages
- Review the Turnkey documentation for authentication issues
- Ensure all dependencies are up to date