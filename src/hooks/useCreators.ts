import { useQuery, useQueryClient } from '@tanstack/react-query';
import { creators as staticCreators } from '../creators';
import { Creator } from '../types';

// Simulated API call - in real app this would be an actual API endpoint
const fetchCreators = async (): Promise<Creator[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call
  // return fetch('/api/creators').then(res => res.json());
  
  // For now, return static data with simulated server-side enhancements
  return staticCreators.map(creator => ({
    ...creator,
    // Add server-calculated stats that could come from API
    lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isVerified: Math.random() > 0.3, // 70% chance of being verified
  }));
};

// Simulated creator search API
const searchCreators = async (query: string): Promise<Creator[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const allCreators = await fetchCreators();
  
  if (!query.trim()) return allCreators;
  
  return allCreators.filter(creator =>
    creator.name.toLowerCase().includes(query.toLowerCase()) ||
    creator.description.toLowerCase().includes(query.toLowerCase()) ||
    creator.category.toLowerCase().includes(query.toLowerCase())
  );
};

// Main hook for fetching all creators
export const useCreators = () => {
  return useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
    staleTime: 5 * 60 * 1000, // 5 minutes - creator data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for searching creators with debouncing
export const useCreatorSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['creators', 'search', query],
    queryFn: () => searchCreators(query),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    enabled: enabled && query.length >= 0, // Enable for empty query too (shows all)
    retry: 2,
  });
};

// Hook for getting a specific creator
export const useCreator = (creatorId: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['creators', creatorId],
    queryFn: async () => {
      // Try to get from creators cache first
      const creatorsCache = queryClient.getQueryData<Creator[]>(['creators']);
      if (creatorsCache) {
        const creator = creatorsCache.find(c => c.id === creatorId);
        if (creator) return creator;
      }
      
      // If not in cache, fetch all creators and return the specific one
      const creators = await fetchCreators();
      return creators.find(c => c.id === creatorId) || null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!creatorId,
  });
};

// Hook for prefetching creators (useful for performance)
export const usePrefetchCreators = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: ['creators'],
      queryFn: fetchCreators,
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Utility hook for invalidating creator-related queries
export const useInvalidateCreators = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['creators'] }),
    invalidateSearch: () => queryClient.invalidateQueries({ queryKey: ['creators', 'search'] }),
    invalidateCreator: (creatorId: string) => 
      queryClient.invalidateQueries({ queryKey: ['creators', creatorId] }),
  };
};