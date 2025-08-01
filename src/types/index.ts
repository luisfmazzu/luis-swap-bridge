export interface Creator {
  id: string;
  name: string;
  description: string;
  address: `0x${string}`;
  avatar?: string;
  totalTips?: string;
  tipCount?: number;
}

export interface Tip {
  id: string;
  recipient: `0x${string}`;
  sender: `0x${string}`;
  amount: string;
  txHash: `0x${string}`;
  timestamp: string;
  creatorName?: string;
}

export interface AppState {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  balance: string | null;
  ensName: string | null;
  recentTips: Tip[];
  selectedCreator: Creator | null;
  isModalOpen: boolean;
}

export interface GasData {
  slow: string;
  average: string;
  fast: string;
  timestamp: number;
}