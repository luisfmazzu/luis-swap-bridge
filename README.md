# Decentralized Tipping Platform

A modern, beautiful Web3 application for sending cryptocurrency tips directly to creators using the Ethereum blockchain. Built with React, TypeScript, and Wagmi for seamless blockchain integration.

## 🎯 Project Goal

This platform enables users to support their favorite creators with cryptocurrency tips in a decentralized, transparent, and direct manner. By leveraging blockchain technology, tips go directly to creators without intermediaries, ensuring maximum value transfer and transparency.

### Key Features

- **Direct Creator Support**: Send ETH tips directly to creator wallets
- **Transparent Transactions**: All tips are recorded on the blockchain
- **Real-time Tracking**: Monitor transaction status and gas fees
- **Beautiful UI/UX**: Mobile-responsive design with smooth animations
- **Transaction History**: Complete record of all tips sent and received
- **Multi-wallet Support**: Compatible with MetaMask, WalletConnect, and more

## 🛠️ Technologies & Techniques

### Frontend Framework
- **React 18** with TypeScript for type-safe development
- **Vite** as the build tool for fast development and optimized builds
- **React Router** for client-side navigation

### Web3 Integration
- **Wagmi** - Comprehensive React hooks for Ethereum development
- **Viem** - Type-safe Ethereum library for transaction handling
- **Ethereum Sepolia Testnet** for safe testing and development

### UI/UX Technologies
- **Tailwind CSS** for utility-first styling
- **ShadCN/UI** for accessible, customizable components
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent iconography
- **React Toastify** for user notifications

### State Management & Data
- **Zustand** for lightweight, persistent state management
- **React Query** (via Wagmi) for efficient data fetching and caching
- **LocalStorage** persistence for user preferences and history

### Development Tools
- **TypeScript** for static type checking
- **ESLint** and **Prettier** for code quality
- **PostCSS** with Tailwind for CSS processing

## 🔗 Wagmi Integration

This project demonstrates comprehensive use of Wagmi's React hooks and utilities for Web3 development. Wagmi provides type-safe, efficient hooks for:

- **Wallet Connection Management**: Multi-wallet support with connection state
- **Account Management**: User account data and authentication
- **Transaction Handling**: Sending transactions with real-time status
- **Balance Queries**: Real-time ETH balance monitoring  
- **Gas Fee Tracking**: Dynamic gas price monitoring and estimation
- **Network Management**: Sepolia testnet configuration and switching
- **Transaction Receipts**: Confirmation and receipt validation

For detailed implementation specifics, including exact hook usage, parameters, and code locations, see [Wagmi_Implementation.md](./Wagmi_Implementation.md).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for testing

### Installation

1. Clone the repository:
```bash
git clone https://github.com/luisfmazzu/web3-react-wagmi.git
cd web3-react-wagmi
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN base components
│   ├── CreatorCard.tsx # Creator display component
│   ├── Header.tsx      # Navigation header
│   ├── TipModal.tsx    # Transaction modal
│   └── ...             # Other components
├── pages/              # Route components
│   ├── Landing.tsx     # Landing page
│   ├── Dashboard.tsx   # Main dashboard
│   └── MyTips.tsx      # Transaction history
├── stores/             # Zustand state management
├── utils/              # Utility functions
├── styles/             # Global styles
└── types.ts            # TypeScript definitions
```

## 🌐 Live Demo Features

1. **Landing Page**: Hero section with animated elements and featured creators
2. **Dashboard**: Comprehensive view with wallet info, gas tracker, and creator discovery
3. **Tip Flow**: Multi-step transaction process with real-time feedback
4. **History**: Complete transaction history with filtering and search
5. **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🧪 Testing

The application is configured for Sepolia testnet testing:
- Get Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Connect your wallet and switch to Sepolia network
- Start tipping creators with test ETH

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🔐 Security Considerations

- All transactions occur on-chain with full transparency
- Private keys never leave the user's wallet
- Smart contract interactions are read-only (simple ETH transfers)
- Testnet environment for safe testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wagmi](https://wagmi.sh/) for excellent Web3 React hooks
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful, accessible components
- [Viem](https://viem.sh/) for type-safe Ethereum utilities
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling