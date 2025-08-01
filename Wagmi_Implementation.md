# Wagmi Implementation Guide

This document provides a comprehensive overview of how Wagmi React hooks and utilities are implemented throughout the Decentralized Tipping Platform. Each section details the specific hooks used, their parameters, implementation location, and the reasoning behind their usage.

## Table of Contents

- [Configuration Setup](#configuration-setup)
- [Account Management](#account-management)
- [Balance Monitoring](#balance-monitoring)
- [Transaction Handling](#transaction-handling)
- [Gas Fee Tracking](#gas-fee-tracking)
- [Transaction Receipts](#transaction-receipts)
- [Provider Integration](#provider-integration)

## Configuration Setup

### Wagmi Configuration
**File**: `src/wagmi.ts`  
**Lines**: 4-23

```typescript
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http()
  },
})
```

**Purpose**: 
- Establishes the core Wagmi configuration for the entire application
- Configures Sepolia testnet as the primary network for safe testing
- Sets up multiple wallet connectors (MetaMask via injected, WalletConnect)
- Defines HTTP transport for blockchain communication

**Why Used**: Essential foundation that enables all other Wagmi hooks to function properly. The configuration ensures type safety and provides the necessary blockchain connection parameters.

---

## Account Management

### useAccount Hook
**File**: `src/components/Header.tsx`  
**Line**: 15

```typescript
const { address, isConnected } = useAccount();
```

**Purpose**: 
- Retrieves current connected wallet address
- Monitors wallet connection status
- Provides reactive updates when wallet state changes

**File**: `src/pages/Landing.tsx`  
**Line**: 11

```typescript
const { isConnected } = useAccount();
```

**Purpose**:
- Conditionally renders UI elements based on wallet connection
- Enables/disables creator tip functionality

**File**: `src/pages/Dashboard.tsx`  
**Line**: 16

```typescript
const { isConnected } = useAccount();
```

**Purpose**:
- Controls dashboard functionality access
- Shows different messaging for connected vs disconnected states

**File**: `src/pages/MyTips.tsx`  
**Line**: 22

```typescript
const { address, isConnected } = useAccount();
```

**Purpose**:
- Filters tip history by current user address
- Renders wallet connection prompt when not connected

**File**: `src/components/TipModal.tsx`  
**Line**: 27

```typescript
const { address, isConnected } = useAccount();
```

**Purpose**:
- Validates user can send transactions
- Associates sent tips with sender address
- Controls modal functionality based on connection state

**File**: `src/components/WalletInfo.tsx`  
**Line**: 7

```typescript
const { address, isConnected, connector } = useAccount();
```

**Purpose**:
- Displays comprehensive wallet information
- Shows connected wallet type via connector
- Formats and displays wallet address

**Why Used**: `useAccount` is fundamental for any Web3 application as it provides the primary interface between the user and the blockchain. It enables reactive UI updates and ensures proper user authentication.

---

## Balance Monitoring

### useBalance Hook
**File**: `src/components/TipModal.tsx`  
**Line**: 28

```typescript
const { data: balance } = useBalance({ address });
```

**Purpose**:
- Fetches real-time ETH balance for connected wallet
- Enables balance validation before transactions
- Supports percentage-based tip calculations

**Parameters**:
- `address`: Connected wallet address from useAccount

**File**: `src/components/WalletInfo.tsx`  
**Line**: 8

```typescript
const { data: balance } = useBalance({ 
  address,
  query: { enabled: !!address }
});
```

**Purpose**:
- Displays current wallet balance in dashboard
- Updates automatically when balance changes
- Conditional querying only when address exists

**Parameters**:
- `address`: Wallet address to query
- `query.enabled`: Prevents unnecessary API calls when no address

**Why Used**: Real-time balance information is crucial for transaction validation and user awareness. The hook automatically refetches on block changes, ensuring accurate balance display.

---

## Transaction Handling

### useSendTransaction Hook
**File**: `src/components/TipModal.tsx`  
**Lines**: 41-47

```typescript
const {
  sendTransaction,
  isPending: isSending,
  data: txHash,
  error: sendError,
  reset: resetSend
} = useSendTransaction();
```

**Purpose**:
- Initiates ETH transfer transactions to creator wallets
- Provides transaction status (pending, success, error)
- Returns transaction hash for tracking
- Offers reset functionality for modal cleanup

**Implementation** (Lines 136-148):
```typescript
const handleSendTransaction = () => {
  try {
    sendTransaction({
      to: selectedCreator.address,
      value: parseEther(tipAmount),
    });
  } catch (err: any) {
    setError(err.message || 'Failed to send transaction');
    setStep('error');
  }
};
```

**Parameters**:
- `to`: Recipient address (creator wallet)
- `value`: Amount in wei (converted from ETH using parseEther)

**Why Used**: Core functionality for the tipping platform. This hook manages the entire transaction lifecycle from initiation to completion, providing real-time status updates essential for user experience.

---

## Gas Fee Tracking

### useFeeData Hook
**File**: `src/components/GasTracker.tsx`  
**Line**: 6

```typescript
const { data: feeData, isLoading } = useFeeData();
```

**Purpose**:
- Retrieves current network gas prices
- Monitors gas fee fluctuations in real-time
- Provides base fee, priority fee, and gas price data

**Implementation** (Lines 15-35):
```typescript
const formatGasPrice = (gasPrice: bigint | undefined) => {
  if (!gasPrice) return 'N/A';
  const gwei = Number(gasPrice) / 1e9;
  return `${gwei.toFixed(1)} Gwei`;
};

const gasPriceLevel = getCurrentGasLevel(feeData?.gasPrice);
```

**Data Usage**:
- `feeData.gasPrice`: Current gas price for transaction estimation
- `feeData.maxFeePerGas`: Maximum fee per gas unit
- `feeData.maxPriorityFeePerGas`: Priority fee for faster processing

**Why Used**: Gas fee information is critical for users to understand transaction costs. Real-time gas tracking helps users time their transactions optimally and provides transparency about network fees.

---

## Transaction Receipts

### useWaitForTransactionReceipt Hook
**File**: `src/components/TipModal.tsx`  
**Lines**: 49-55

```typescript
const {
  isLoading: isConfirming,
  isSuccess: isConfirmed,
  error: confirmError
} = useWaitForTransactionReceipt({
  hash: txHash,
});
```

**Purpose**:
- Monitors transaction confirmation status
- Waits for blockchain inclusion and confirmation
- Provides success/failure state for UI updates

**State Management** (Lines 69-93):
```typescript
useEffect(() => {
  if (isSending) {
    setStep('pending');
  } else if (sendError) {
    setStep('error');
  } else if (txHash && isConfirming) {
    toast.info('Transaction submitted! Waiting for confirmation...');
  } else if (isConfirmed && txHash && selectedCreator && address) {
    setStep('success');
    addTip({
      recipient: selectedCreator.address,
      sender: address,
      amount: tipAmount,
      txHash,
      creatorName: selectedCreator.name,
    });
    toast.success('Tip sent successfully! 🎉');
  }
}, [isSending, sendError, txHash, isConfirming, isConfirmed, ...]);
```

**Parameters**:
- `hash`: Transaction hash from useSendTransaction

**Why Used**: Transaction confirmation is essential for reliable user experience. This hook ensures transactions are properly included in blocks before updating the UI and local state, preventing false success states.

---

## Provider Integration

### WagmiProvider Setup
**File**: `src/main.tsx`  
**Lines**: 9-17

```typescript
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
)
```

**Purpose**:
- Provides Wagmi context to entire application
- Integrates React Query for data caching and state management
- Enables all child components to access Wagmi hooks

**Why Used**: Essential for Wagmi functionality. The provider pattern ensures all components have access to Web3 state and functionality while managing global configuration and caching.

---

## Advanced Implementation Patterns

### Conditional Hook Usage
**File**: `src/components/WalletInfo.tsx`  
**Lines**: 8-12

```typescript
const { data: balance } = useBalance({ 
  address,
  query: { enabled: !!address }
});
```

**Pattern**: Conditional querying to prevent unnecessary API calls
**Benefits**: Improved performance and reduced network requests

### Error Handling Integration
**File**: `src/components/TipModal.tsx`  
**Lines**: 72-75

```typescript
} else if (sendError) {
  setStep('error');
  setError(sendError.message);
  toast.error('Transaction failed');
```

**Pattern**: Comprehensive error state management
**Benefits**: User-friendly error reporting and graceful failure handling

### State Synchronization
**File**: `src/components/TipModal.tsx`  
**Lines**: 78-87

```typescript
} else if (isConfirmed && txHash && selectedCreator && address) {
  setStep('success');
  addTip({
    recipient: selectedCreator.address,
    sender: address,
    amount: tipAmount,
    txHash,
    creatorName: selectedCreator.name,
  });
  toast.success('Tip sent successfully! 🎉');
```

**Pattern**: Automatic state updates on transaction success
**Benefits**: Seamless integration between blockchain state and application state

---

## Performance Optimizations

1. **Selective Hook Usage**: Only importing necessary hook returns to minimize re-renders
2. **Conditional Queries**: Using `enabled` parameter to prevent unnecessary network calls
3. **Proper Dependencies**: Careful useEffect dependency management for optimal updates
4. **State Cleanup**: Reset functions for clean modal state management

## Type Safety Features

1. **TypeScript Integration**: Full type safety for all Wagmi hook parameters and returns
2. **Viem Integration**: Type-safe transaction parameters using parseEther and formatEther
3. **Error Type Handling**: Proper TypeScript error handling for blockchain errors

This implementation demonstrates best practices for integrating Wagmi into a production React application, providing a robust, type-safe, and user-friendly Web3 experience.