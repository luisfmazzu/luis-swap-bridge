import { formatEther, parseEther } from 'viem';

export function formatETH(value: bigint | string, decimals: number = 4): string {
  try {
    const etherValue = typeof value === 'string' ? parseEther(value) : value;
    const formatted = formatEther(etherValue);
    return parseFloat(formatted).toFixed(decimals);
  } catch {
    return '0.0000';
  }
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatGasPrice(gasPrice: bigint): string {
  try {
    const gwei = Number(gasPrice) / 1e9;
    return gwei.toFixed(2);
  } catch {
    return '0.00';
  }
}

export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

export function validateETHAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }

  if (numAmount < 0.0001) {
    return { valid: false, error: 'Minimum amount is 0.0001 ETH' };
  }

  if (numAmount > 100) {
    return { valid: false, error: 'Maximum amount is 100 ETH' };
  }

  return { valid: true };
}