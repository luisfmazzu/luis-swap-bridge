import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFeeData } from 'wagmi';

// Enhanced gas data interface
interface EnhancedGasData {
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  baseFee: bigint;
  // Enhanced fields that could come from gas APIs
  gasPriceGwei: number;
  baseFeeGwei: number;
  priorityFeeGwei: number;
  networkCongestion: 'low' | 'medium' | 'high';
  estimatedConfirmationTime: {
    slow: string;
    standard: string;
    fast: string;
  };
  historicalData: {
    avgGasPrice24h: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Simulated enhanced gas data API
const fetchEnhancedGasData = async (): Promise<EnhancedGasData> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In real app, this would combine multiple gas APIs
  // For now, simulate realistic gas data
  const baseGasPrice = Math.floor(Math.random() * 50) + 10; // 10-60 Gwei
  const baseFee = Math.floor(baseGasPrice * 0.8);
  const priorityFee = Math.floor(Math.random() * 5) + 1; // 1-6 Gwei
  
  return {
    gasPrice: BigInt(baseGasPrice * 1e9), // Convert to wei
    maxFeePerGas: BigInt((baseFee + priorityFee) * 1e9),
    maxPriorityFeePerGas: BigInt(priorityFee * 1e9),
    baseFee: BigInt(baseFee * 1e9),
    gasPriceGwei: baseGasPrice,
    baseFeeGwei: baseFee,
    priorityFeeGwei: priorityFee,
    networkCongestion: baseGasPrice > 40 ? 'high' : baseGasPrice > 25 ? 'medium' : 'low',
    estimatedConfirmationTime: {
      slow: `${Math.floor(Math.random() * 5) + 3} min`,
      standard: `${Math.floor(Math.random() * 3) + 1} min`,
      fast: `${Math.floor(Math.random() * 30) + 15} sec`,
    },
    historicalData: {
      avgGasPrice24h: Math.floor(Math.random() * 40) + 15,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
  };
};

// Gas price history for charts
const fetchGasPriceHistory = async (period: '1h' | '24h' | '7d' = '24h') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const points = period === '1h' ? 12 : period === '24h' ? 24 : 168; // 12 points for 1h, 24 for 24h, 168 for 7d
  const history = [];
  
  for (let i = 0; i < points; i++) {
    history.push({
      timestamp: new Date(Date.now() - (points - i) * (period === '1h' ? 5 * 60 * 1000 : period === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
      gasPrice: Math.floor(Math.random() * 40) + 10, // 10-50 Gwei
      baseFee: Math.floor(Math.random() * 35) + 8, // 8-43 Gwei
    });
  }
  
  return history;
};

// Main hook for enhanced gas data with optimizations
export const useEnhancedGasData = () => {
  return useQuery({
    queryKey: ['gas', 'enhanced'],
    queryFn: fetchEnhancedGasData,
    staleTime: 10 * 1000, // 10 seconds - gas prices change frequently
    gcTime: 30 * 1000, // 30 seconds cache
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Use background refetching for smooth UX
    refetchIntervalInBackground: true,
  });
};

// Hook that combines Wagmi gas data with enhanced data
export const useCombinedGasData = () => {
  const wagmiGasData = useFeeData();
  const enhancedGasData = useEnhancedGasData();
  
  return useQuery({
    queryKey: ['gas', 'combined', wagmiGasData.data, enhancedGasData.data],
    queryFn: () => {
      // Combine both data sources
      if (!wagmiGasData.data || !enhancedGasData.data) return null;
      
      return {
        // Primary data from Wagmi (most accurate)
        wagmi: wagmiGasData.data,
        // Enhanced data from our API
        enhanced: enhancedGasData.data,
        // Computed fields
        recommendations: {
          slow: {
            gasPrice: wagmiGasData.data.gasPrice,
            estimatedTime: enhancedGasData.data.estimatedConfirmationTime.slow,
          },
          standard: {
            gasPrice: wagmiGasData.data.maxFeePerGas,
            estimatedTime: enhancedGasData.data.estimatedConfirmationTime.standard,
          },
          fast: {
            gasPrice: (wagmiGasData.data.maxFeePerGas || 0n) + (wagmiGasData.data.maxPriorityFeePerGas || 0n),
            estimatedTime: enhancedGasData.data.estimatedConfirmationTime.fast,
          },
        },
      };
    },
    enabled: !!wagmiGasData.data && !!enhancedGasData.data,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds
  });
};

// Hook for gas price history (useful for charts)
export const useGasPriceHistory = (period: '1h' | '24h' | '7d' = '24h') => {
  return useQuery({
    queryKey: ['gas', 'history', period],
    queryFn: () => fetchGasPriceHistory(period),
    staleTime: period === '1h' ? 2 * 60 * 1000 : period === '24h' ? 10 * 60 * 1000 : 60 * 60 * 1000, // Different stale times based on period
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
  });
};

// Hook for gas price alerts/notifications
export const useGasPriceAlerts = (targetPrice?: number) => {
  const gasData = useEnhancedGasData();
  
  return useQuery({
    queryKey: ['gas', 'alerts', targetPrice],
    queryFn: () => {
      if (!gasData.data || !targetPrice) return null;
      
      const currentPrice = gasData.data.gasPriceGwei;
      
      return {
        isTargetMet: currentPrice <= targetPrice,
        currentPrice,
        targetPrice,
        difference: currentPrice - targetPrice,
        percentageDiff: ((currentPrice - targetPrice) / targetPrice) * 100,
        shouldNotify: currentPrice <= targetPrice,
      };
    },
    enabled: !!gasData.data && !!targetPrice,
    staleTime: 5 * 1000, // 5 seconds for alerts
  });
};

// Hook for gas estimation for specific transaction types
export const useGasEstimation = (transactionType: 'tip' | 'swap' | 'approval') => {
  return useQuery({
    queryKey: ['gas', 'estimation', transactionType],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate gas estimation for different transaction types
      const baseGas = {
        tip: 21000, // Simple ETH transfer
        swap: 150000, // DEX swap
        approval: 45000, // ERC-20 approval
      };
      
      const estimated = baseGas[transactionType];
      
      return {
        gasLimit: estimated,
        gasLimitWithBuffer: Math.floor(estimated * 1.2), // 20% buffer
        transactionType,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - gas limits don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

// Utility hook for gas-related query management
export const useGasQueryUtils = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['gas'] }),
    invalidateEnhanced: () => queryClient.invalidateQueries({ queryKey: ['gas', 'enhanced'] }),
    invalidateHistory: () => queryClient.invalidateQueries({ queryKey: ['gas', 'history'] }),
    prefetchHistory: (period: '1h' | '24h' | '7d') => 
      queryClient.prefetchQuery({
        queryKey: ['gas', 'history', period],
        queryFn: () => fetchGasPriceHistory(period),
      }),
  };
};