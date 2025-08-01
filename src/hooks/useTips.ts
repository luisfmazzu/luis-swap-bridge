import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useAppStore } from '../stores/appStore';
import { Tip } from '../types';

// Simulated API calls - in real app these would be actual API endpoints
const fetchRecentTips = async (): Promise<Tip[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real app, this would fetch from server/blockchain
  // For now, get from local store and add some mock recent tips
  const mockRecentTips: Tip[] = [
    {
      id: 'recent-1',
      recipient: '0x742d35Cc6635C0532925a3b8d09F6F6c4b9b9a3c',
      sender: '0x8ba1f109551bD432803012645Hac136c',
      amount: '0.05',
      txHash: '0x1234...abcd',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      creatorName: 'Alice Creator',
    },
    {
      id: 'recent-2', 
      recipient: '0x123d35Cc6635C0532925a3b8d09F9F6c4b9b1234',
      sender: '0x9ba1f109551bD432803012645Hac987d',
      amount: '0.1',
      txHash: '0x5678...efgh',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      creatorName: 'Bob Artist',
    },
  ];
  
  return mockRecentTips;
};

const fetchUserTips = async (address: string): Promise<Tip[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // In real app, fetch user's tip history from API/blockchain
  // For now, simulate with filtered local data
  const allTips = await fetchRecentTips();
  return allTips.filter(tip => 
    tip.sender.toLowerCase() === address.toLowerCase()
  );
};

const fetchTipAnalytics = async (address?: string) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simulate analytics calculation
  const mockAnalytics = {
    totalTipped: Math.random() * 10,
    totalReceived: Math.random() * 5,
    transactionCount: Math.floor(Math.random() * 50) + 10,
    uniqueCreators: Math.floor(Math.random() * 20) + 5,
    averageTipAmount: Math.random() * 0.5 + 0.01,
    last24hTips: Math.floor(Math.random() * 10),
    trending: {
      period: 'weekly',
      change: (Math.random() - 0.5) * 100, // -50% to +50%
    },
  };
  
  return mockAnalytics;
};

// Hook for fetching recent tips across the platform
export const useRecentTips = () => {
  return useQuery({
    queryKey: ['tips', 'recent'],
    queryFn: fetchRecentTips,
    staleTime: 30 * 1000, // 30 seconds - tips should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
    retry: 3,
  });
};

// Hook for fetching user-specific tips
export const useUserTips = (address?: string) => {
  return useQuery({
    queryKey: ['tips', 'user', address],
    queryFn: () => fetchUserTips(address!),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !!address,
    retry: 2,
  });
};

// Hook for infinite loading of tip history (useful for long lists)
export const useInfiniteTips = (address?: string) => {
  return useInfiniteQuery({
    queryKey: ['tips', 'infinite', address],
    queryFn: async ({ pageParam = 0 }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate paginated tip fetching
      const allTips = await fetchUserTips(address!);
      const pageSize = 10;
      const start = pageParam * pageSize;
      const end = start + pageSize;
      
      return {
        tips: allTips.slice(start, end),
        nextPage: end < allTips.length ? pageParam + 1 : undefined,
        hasMore: end < allTips.length,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for tip analytics/statistics
export const useTipAnalytics = (address?: string) => {
  return useQuery({
    queryKey: ['tips', 'analytics', address],
    queryFn: () => fetchTipAnalytics(address),
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics don't need to be super fresh
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    enabled: !!address,
  });
};

// Mutation for optimistic tip updates
export const useOptimisticTip = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const addTip = useAppStore(state => state.addTip);
  
  return useMutation({
    mutationFn: async (tipData: Omit<Tip, 'id' | 'timestamp'>) => {
      // In real app, this would send to server/blockchain
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newTip: Tip = {
        ...tipData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      
      return newTip;
    },
    onMutate: async (tipData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tips', 'recent'] });
      await queryClient.cancelQueries({ queryKey: ['tips', 'user', address] });
      
      // Snapshot the previous values
      const previousRecentTips = queryClient.getQueryData<Tip[]>(['tips', 'recent']);
      const previousUserTips = queryClient.getQueryData<Tip[]>(['tips', 'user', address]);
      
      // Optimistically update the cache
      const optimisticTip: Tip = {
        ...tipData,
        id: `optimistic-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      
      if (previousRecentTips) {
        queryClient.setQueryData(['tips', 'recent'], [optimisticTip, ...previousRecentTips]);
      }
      
      if (previousUserTips && address) {
        queryClient.setQueryData(['tips', 'user', address], [optimisticTip, ...previousUserTips]);
      }
      
      return { previousRecentTips, previousUserTips };
    },
    onError: (err, tipData, context) => {
      // Rollback on error
      if (context?.previousRecentTips) {
        queryClient.setQueryData(['tips', 'recent'], context.previousRecentTips);
      }
      if (context?.previousUserTips) {
        queryClient.setQueryData(['tips', 'user', address], context.previousUserTips);
      }
    },
    onSuccess: (newTip) => {
      // Add to local store for persistence
      addTip({
        recipient: newTip.recipient,
        sender: newTip.sender,
        amount: newTip.amount,
        txHash: newTip.txHash,
        creatorName: newTip.creatorName,
      });
      
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['tips', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['creators'] }); // May affect creator stats
    },
  });
};

// Hook for tip-related query invalidations
export const useInvalidateTips = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['tips'] }),
    invalidateRecent: () => queryClient.invalidateQueries({ queryKey: ['tips', 'recent'] }),
    invalidateUser: (address: string) => 
      queryClient.invalidateQueries({ queryKey: ['tips', 'user', address] }),
    invalidateAnalytics: () => queryClient.invalidateQueries({ queryKey: ['tips', 'analytics'] }),
  };
};

// Combined hook for dashboard tip data
export const useDashboardTips = () => {
  const { address } = useAccount();
  
  const recentTips = useRecentTips();
  const userTips = useUserTips(address);
  const analytics = useTipAnalytics(address);
  
  return {
    recentTips,
    userTips,
    analytics,
    isLoading: recentTips.isLoading || userTips.isLoading || analytics.isLoading,
    isError: recentTips.isError || userTips.isError || analytics.isError,
    error: recentTips.error || userTips.error || analytics.error,
  };
};