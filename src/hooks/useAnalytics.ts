import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

// Analytics data interfaces
interface DashboardAnalytics {
  totalUsers: number;
  totalTips: number;
  totalVolume: string; // ETH amount
  totalCreators: number;
  last24h: {
    tips: number;
    volume: string;
    newUsers: number;
  };
  trends: {
    tipsGrowth: number; // percentage
    volumeGrowth: number; // percentage
    userGrowth: number; // percentage
  };
}

interface CreatorAnalytics {
  creatorId: string;
  totalReceived: string; // ETH amount
  tipCount: number;
  uniqueTippers: number;
  averageTip: string; // ETH amount
  last30Days: {
    received: string;
    tips: number;
    growth: number; // percentage
  };
  topTippers: Array<{
    address: string;
    amount: string;
    tipCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    tips: number;
    volume: string;
  }>;
}

interface UserAnalytics {
  userAddress: string;
  totalTipped: string; // ETH amount
  tipCount: number;
  uniqueCreators: number;
  averageTip: string; // ETH amount
  last30Days: {
    tipped: string;
    tips: number;
    creatorsSupported: number;
  };
  favoriteCreators: Array<{
    creatorId: string;
    name: string;
    totalTipped: string;
    tipCount: number;
  }>;
  monthlyStats: Array<{
    month: string;
    tips: number;
    volume: string;
  }>;
}

// Simulated API calls for analytics
const fetchDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simulate realistic platform analytics
  return {
    totalUsers: Math.floor(Math.random() * 10000) + 5000,
    totalTips: Math.floor(Math.random() * 50000) + 25000,
    totalVolume: (Math.random() * 1000 + 500).toFixed(2),
    totalCreators: Math.floor(Math.random() * 500) + 200,
    last24h: {
      tips: Math.floor(Math.random() * 200) + 50,
      volume: (Math.random() * 50 + 10).toFixed(2),
      newUsers: Math.floor(Math.random() * 50) + 10,
    },
    trends: {
      tipsGrowth: (Math.random() - 0.5) * 50, // -25% to +25%
      volumeGrowth: (Math.random() - 0.5) * 60, // -30% to +30%
      userGrowth: Math.random() * 30, // 0% to +30%
    },
  };
};

const fetchCreatorAnalytics = async (creatorId: string): Promise<CreatorAnalytics> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate daily stats for the last 30 days
  const dailyStats = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tips: Math.floor(Math.random() * 10),
    volume: (Math.random() * 2).toFixed(4),
  }));
  
  return {
    creatorId,
    totalReceived: (Math.random() * 100 + 10).toFixed(4),
    tipCount: Math.floor(Math.random() * 500) + 50,
    uniqueTippers: Math.floor(Math.random() * 200) + 20,
    averageTip: (Math.random() * 0.5 + 0.01).toFixed(4),
    last30Days: {
      received: (Math.random() * 20 + 2).toFixed(4),
      tips: Math.floor(Math.random() * 50) + 10,
      growth: (Math.random() - 0.5) * 100, // -50% to +50%
    },
    topTippers: Array.from({ length: 5 }, (_, i) => ({
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      amount: (Math.random() * 5 + 0.1).toFixed(4),
      tipCount: Math.floor(Math.random() * 20) + 1,
    })),
    dailyStats,
  };
};

const fetchUserAnalytics = async (userAddress: string): Promise<UserAnalytics> => {
  await new Promise(resolve => setTimeout(resolve, 350));
  
  // Generate monthly stats for the last 12 months
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toISOString().substring(0, 7), // YYYY-MM format
      tips: Math.floor(Math.random() * 20),
      volume: (Math.random() * 5).toFixed(4),
    };
  });
  
  return {
    userAddress,
    totalTipped: (Math.random() * 50 + 5).toFixed(4),
    tipCount: Math.floor(Math.random() * 200) + 20,
    uniqueCreators: Math.floor(Math.random() * 50) + 5,
    averageTip: (Math.random() * 0.3 + 0.01).toFixed(4),
    last30Days: {
      tipped: (Math.random() * 10 + 1).toFixed(4),
      tips: Math.floor(Math.random() * 30) + 5,
      creatorsSupported: Math.floor(Math.random() * 10) + 2,
    },
    favoriteCreators: Array.from({ length: 3 }, (_, i) => ({
      creatorId: `creator-${i + 1}`,
      name: ['Alice Creator', 'Bob Artist', 'Charlie Developer'][i],
      totalTipped: (Math.random() * 10 + 1).toFixed(4),
      tipCount: Math.floor(Math.random() * 50) + 5,
    })),
    monthlyStats,
  };
};

// Hook for dashboard analytics
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: fetchDashboardAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics don't need to be super fresh
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes for updated stats
    retry: 2,
  });
};

// Hook for creator-specific analytics
export const useCreatorAnalytics = (creatorId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'creator', creatorId],
    queryFn: () => fetchCreatorAnalytics(creatorId!),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !!creatorId,
    retry: 2,
  });
};

// Hook for user-specific analytics
export const useUserAnalytics = (userAddress?: string) => {
  return useQuery({
    queryKey: ['analytics', 'user', userAddress],
    queryFn: () => fetchUserAnalytics(userAddress!),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !!userAddress,
    retry: 2,
  });
};

// Hook for current user analytics (convenience hook)
export const useCurrentUserAnalytics = () => {
  const { address } = useAccount();
  return useUserAnalytics(address);
};

// Hook for leaderboard data
export const useLeaderboard = (type: 'creators' | 'tippers' = 'creators', period: '24h' | '7d' | '30d' | 'all' = '30d') => {
  return useQuery({
    queryKey: ['analytics', 'leaderboard', type, period],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
      
      if (type === 'creators') {
        return Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          creatorId: `creator-${i + 1}`,
          name: `Creator ${i + 1}`,
          avatar: ['🎨', '🎵', '📝', '🎮', '📸', '🎭', '🎪', '🎯', '🎲', '🎊'][i],
          totalReceived: (Math.random() * 20 + 5).toFixed(4),
          tipCount: Math.floor(Math.random() * 100) + 10,
          growth: (Math.random() - 0.5) * 50, // -25% to +25%
        }));
      } else {
        return Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          totalTipped: (Math.random() * 15 + 2).toFixed(4),
          tipCount: Math.floor(Math.random() * 80) + 5,
          creatorsSupported: Math.floor(Math.random() * 20) + 3,
        }));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    retry: 2,
  });
};

// Hook for real-time activity feed
export const useActivityFeed = (limit = 20) => {
  return useQuery({
    queryKey: ['analytics', 'activity', limit],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return Array.from({ length: limit }, (_, i) => ({
        id: `activity-${i}`,
        type: ['tip', 'join', 'achievement'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          user: `0x${Math.random().toString(16).substring(2, 42)}`,
          creator: Math.random() > 0.5 ? `Creator ${Math.floor(Math.random() * 10) + 1}` : undefined,
          amount: Math.random() > 0.5 ? (Math.random() * 1).toFixed(4) : undefined,
          achievement: Math.random() > 0.7 ? 'First Tip' : undefined,
        },
      }));
    },
    staleTime: 30 * 1000, // 30 seconds - activity should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
  });
};

// Hook for trending analysis
export const useTrendingAnalysis = (timeframe: '1h' | '24h' | '7d' = '24h') => {
  return useQuery({
    queryKey: ['analytics', 'trending', timeframe],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        trendingCreators: Array.from({ length: 5 }, (_, i) => ({
          creatorId: `trending-creator-${i}`,
          name: `Trending Creator ${i + 1}`,
          growth: Math.random() * 200 + 50, // 50% to 250% growth
          newTips: Math.floor(Math.random() * 50) + 10,
        })),
        trendingCategories: ['Art', 'Music', 'Gaming', 'Writing', 'Photography'].map(category => ({
          category,
          growth: (Math.random() - 0.3) * 100, // -30% to +70%
          tipCount: Math.floor(Math.random() * 100) + 20,
        })),
        networkActivity: {
          peakHour: Math.floor(Math.random() * 24),
          averageTipsPerHour: Math.floor(Math.random() * 50) + 10,
          networkHealth: Math.random() > 0.8 ? 'excellent' : Math.random() > 0.5 ? 'good' : 'fair',
        },
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 2,
  });
};

// Utility hook for analytics query management
export const useAnalyticsQueryUtils = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] }),
    invalidateUser: (address: string) => 
      queryClient.invalidateQueries({ queryKey: ['analytics', 'user', address] }),
    invalidateCreator: (creatorId: string) =>
      queryClient.invalidateQueries({ queryKey: ['analytics', 'creator', creatorId] }),
    prefetchUserAnalytics: (address: string) =>
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'user', address],
        queryFn: () => fetchUserAnalytics(address),
      }),
  };
};