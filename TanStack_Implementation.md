# TanStack Query Implementation Guide

This document provides a comprehensive overview of how TanStack Query (React Query) is implemented throughout the Decentralized Tipping Platform. Each section details specific query patterns, optimization strategies, and real-world implementation examples with exact file locations and code snippets.

## Table of Contents

- [Configuration & Setup](#configuration--setup)
- [Custom Query Hooks](#custom-query-hooks)
- [Caching Strategies](#caching-strategies)
- [Real-time Data Management](#real-time-data-management)
- [Optimistic Updates](#optimistic-updates)
- [Error Handling & Retry Logic](#error-handling--retry-logic)
- [Infinite Queries](#infinite-queries)
- [Query Invalidation Patterns](#query-invalidation-patterns)
- [Performance Optimizations](#performance-optimizations)

## Configuration & Setup

### QueryClient Configuration
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
- Establishes QueryClient instance with default configuration
- Provides React Query context to entire application
- Integrates with Wagmi's existing React Query usage

**Why Used**: Essential setup that enables all TanStack Query features throughout the app. The default configuration works well for most use cases, with specific query configurations handled at the hook level.

---

## Custom Query Hooks

### Creator Data Management
**File**: `src/hooks/useCreators.ts`  
**Lines**: 1-139

#### Main Creator Query
**Lines**: 25-35
```typescript
export const useCreators = () => {
  return useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

**Purpose**: 
- Fetches all creators with intelligent caching
- Implements exponential backoff retry strategy
- Long stale time since creator data changes infrequently

**Implementation in Components**:
- **Dashboard.tsx:21** - `const { data: allCreators, isLoading: isLoadingCreators, error: creatorsError } = useCreators();`

#### Search with Debouncing
**Lines**: 37-47
```typescript
export const useCreatorSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['creators', 'search', query],
    queryFn: () => searchCreators(query),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    enabled: enabled && query.length >= 0,
    retry: 2,
  });
};
```

**Purpose**:
- Enables real-time search without excessive API calls
- Caches search results for improved performance
- Conditional querying based on search input

**Implementation**: 
- **Dashboard.tsx:22** - `const { data: searchResults, isLoading: isSearching } = useCreatorSearch(searchTerm, searchTerm.length > 0);`

**Why Used**: Search queries have different caching needs than static data - shorter stale times for freshness while still providing performance benefits.

---

### Enhanced Gas Data Management
**File**: `src/hooks/useGasData.ts`  
**Lines**: 1-206

#### Real-time Gas Monitoring
**Lines**: 50-62
```typescript
export const useEnhancedGasData = () => {
  return useQuery({
    queryKey: ['gas', 'enhanced'],
    queryFn: fetchEnhancedGasData,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds cache
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchIntervalInBackground: true,
  });
};
```

**Purpose**:
- Provides real-time gas price updates
- Background refetching maintains data freshness
- Short stale times for highly dynamic data

**Implementation**:
- **GasTracker.tsx:8** - `const { data: enhancedGasData, isLoading, isError, error } = useEnhancedGasData();`

**Advanced Pattern - Combined Data Sources**:
**Lines**: 65-89
```typescript
export const useCombinedGasData = () => {
  const wagmiGasData = useFeeData();
  const enhancedGasData = useEnhancedGasData();
  
  return useQuery({
    queryKey: ['gas', 'combined', wagmiGasData.data, enhancedGasData.data],
    queryFn: () => {
      if (!wagmiGasData.data || !enhancedGasData.data) return null;
      
      return {
        wagmi: wagmiGasData.data,
        enhanced: enhancedGasData.data,
        recommendations: {
          // Computed gas recommendations
        },
      };
    },
    enabled: !!wagmiGasData.data && !!enhancedGasData.data,
    staleTime: 10 * 1000,
  });
};
```

**Purpose**: 
- Combines multiple data sources into unified interface
- Dependent queries with proper enablement logic
- Computed fields for enhanced UX

**Why Used**: Demonstrates advanced TanStack Query patterns for complex data dependencies and real-time requirements.

---

## Caching Strategies

### Multi-tiered Cache Approach

#### Short-lived Cache (10-30 seconds)
**Use Cases**: Gas prices, real-time network data
```typescript
staleTime: 10 * 1000,
gcTime: 30 * 1000,
refetchInterval: 15 * 1000,
```

#### Medium-term Cache (2-5 minutes)
**Use Cases**: User analytics, search results
```typescript
staleTime: 2 * 60 * 1000,
gcTime: 10 * 60 * 1000,
```

#### Long-term Cache (5-30 minutes)
**Use Cases**: Creator data, static configuration
```typescript
staleTime: 5 * 60 * 1000,
gcTime: 30 * 60 * 1000,
```

### Cache Key Strategies
**File**: `src/hooks/useCreators.ts`  
**Lines**: 28, 40, 54

```typescript
// Hierarchical cache keys for efficient invalidation
queryKey: ['creators'],                    // All creators
queryKey: ['creators', 'search', query],   // Search results
queryKey: ['creators', creatorId],         // Individual creator
```

**Purpose**: 
- Enables partial cache invalidation
- Prevents cache conflicts between different data sets
- Supports efficient cache management

---

## Real-time Data Management

### Background Refetching
**File**: `src/hooks/useGasData.ts`  
**Lines**: 58-59

```typescript
refetchInterval: 15 * 1000,
refetchIntervalInBackground: true,
```

**Purpose**:
- Maintains data freshness without user interaction
- Continues updates when tab is not focused
- Critical for time-sensitive data like gas prices

### Activity Feed Updates
**File**: `src/hooks/useAnalytics.ts`  
**Lines**: 139-151

```typescript
export const useActivityFeed = (limit = 20) => {
  return useQuery({
    queryKey: ['analytics', 'activity', limit],
    queryFn: async () => {
      // Fetch recent platform activity
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Update every minute
    retry: 2,
  });
};
```

**Purpose**: 
- Live activity updates for engagement
- Balanced update frequency for performance
- Short cache times for real-time feel

**Why Used**: Real-time features require careful balance between freshness and performance. TanStack Query's background refetching enables seamless updates.

---

## Optimistic Updates

### Tip Transaction Optimism
**File**: `src/hooks/useTips.ts`  
**Lines**: 93-150

```typescript
export const useOptimisticTip = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  
  return useMutation({
    mutationFn: async (tipData: Omit<Tip, 'id' | 'timestamp'>) => {
      // Actual API call
    },
    onMutate: async (tipData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tips', 'recent'] });
      
      // Snapshot previous values
      const previousRecentTips = queryClient.getQueryData<Tip[]>(['tips', 'recent']);
      
      // Optimistically update cache
      const optimisticTip: Tip = {
        ...tipData,
        id: `optimistic-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['tips', 'recent'], [optimisticTip, ...previousRecentTips]);
      
      return { previousRecentTips };
    },
    onError: (err, tipData, context) => {
      // Rollback on error
      if (context?.previousRecentTips) {
        queryClient.setQueryData(['tips', 'recent'], context.previousRecentTips);
      }
    },
    onSuccess: (newTip) => {
      // Invalidate related queries for fresh data
      queryClient.invalidateQueries({ queryKey: ['tips', 'analytics'] });
    },
  });
};
```

**Purpose**:
- Instant UI feedback for better UX
- Automatic rollback on failures
- Coordinated cache updates across related data

**Pattern Breakdown**:
1. **onMutate**: Immediate optimistic update
2. **onError**: Rollback to previous state
3. **onSuccess**: Invalidate related caches for consistency

**Why Used**: Critical for Web3 applications where blockchain transactions can take time. Users see immediate feedback while maintaining data integrity.

---

## Error Handling & Retry Logic

### Exponential Backoff Strategy
**File**: `src/hooks/useCreators.ts`  
**Lines**: 32-33

```typescript
retry: 3,
retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
```

**Purpose**:
- Handles transient network failures gracefully
- Prevents overwhelming servers with rapid retries
- Caps maximum delay for reasonable UX

### Context-aware Error Handling
**File**: `src/components/TipAnalytics.tsx`  
**Lines**: 137-146

```typescript
{analyticsError && !isLoading && (
  <div className="flex items-center justify-center py-8">
    <AlertCircle className="h-8 w-8 text-red-400 mr-3" />
    <div className="text-center">
      <p className="text-red-400 font-medium">Failed to load analytics</p>
      <p className="text-white/60 text-sm">Please try again later</p>
    </div>
  </div>
)}
```

**Purpose**:
- User-friendly error messages
- Contextual error handling per component
- Maintains app functionality during partial failures

**Implementation Pattern**:
1. Check error state from query
2. Display contextual error message
3. Provide fallback or retry options
4. Maintain app stability

---

## Infinite Queries

### Transaction History Pagination
**File**: `src/hooks/useTips.ts`  
**Lines**: 58-78

```typescript
export const useInfiniteTips = (address?: string) => {
  return useInfiniteQuery({
    queryKey: ['tips', 'infinite', address],
    queryFn: async ({ pageParam = 0 }) => {
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
    staleTime: 2 * 60 * 1000,
  });
};
```

**Purpose**:
- Efficient loading of large transaction lists
- Progressive loading reduces initial load time
- Smooth infinite scroll UX

**Key Features**:
- **initialPageParam**: Starting point for pagination
- **getNextPageParam**: Determines next page logic
- **pageParam**: Automatic page parameter management

**Why Used**: Essential for applications with potentially large datasets. Provides better performance and UX compared to loading all data at once.

---

## Query Invalidation Patterns

### Utility Hooks for Cache Management
**File**: `src/hooks/useCreators.ts`  
**Lines**: 78-88

```typescript
export const useInvalidateCreators = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['creators'] }),
    invalidateSearch: () => queryClient.invalidateQueries({ queryKey: ['creators', 'search'] }),
    invalidateCreator: (creatorId: string) => 
      queryClient.invalidateQueries({ queryKey: ['creators', creatorId] }),
  };
};
```

**Purpose**:
- Centralized cache invalidation logic
- Granular invalidation control
- Reusable across components

### Coordinated Invalidation
**File**: `src/hooks/useTips.ts`  
**Lines**: 144-147

```typescript
onSuccess: (newTip) => {
  // Invalidate related queries to refetch fresh data
  queryClient.invalidateQueries({ queryKey: ['tips', 'analytics'] });
  queryClient.invalidateQueries({ queryKey: ['creators'] }); // May affect creator stats
},
```

**Purpose**:
- Maintains data consistency across related queries
- Automatic cache updates after mutations
- Prevents stale data issues

**Invalidation Strategy**:
1. **Immediate**: Direct data changes
2. **Related**: Data that depends on changed data
3. **Conditional**: Based on business logic

---

## Performance Optimizations

### Query Prefetching
**File**: `src/hooks/useCreators.ts`  
**Lines**: 68-76

```typescript
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
```

**Purpose**:
- Preload data before it's needed
- Improves perceived performance
- Reduces loading states

### Selective Data Updates
**File**: `src/pages/Dashboard.tsx`  
**Lines**: 25-31

```typescript
const filteredCreators = useMemo(() => {
  if (searchTerm.length > 0) {
    return searchResults || [];
  }
  return allCreators || [];
}, [searchTerm, searchResults, allCreators]);
```

**Purpose**:
- Prevents unnecessary re-renders
- Optimizes search result handling
- Coordinates multiple query states

### Query Coordination
**File**: `src/hooks/useTips.ts`  
**Lines**: 174-186

```typescript
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
```

**Purpose**:
- Coordinates multiple related queries
- Unified loading and error states
- Simplifies component logic

**Why Used**: Composite hooks reduce complexity in components while maintaining fine-grained control over individual queries.

---

## Advanced Patterns

### Dependent Queries
**File**: `src/hooks/useGasData.ts`  
**Lines**: 82-83

```typescript
enabled: !!wagmiGasData.data && !!enhancedGasData.data,
```

**Purpose**: Ensures queries only run when dependencies are available

### Dynamic Query Keys
**File**: `src/hooks/useAnalytics.ts`  
**Lines**: 77-78

```typescript
queryKey: ['analytics', 'leaderboard', type, period],
```

**Purpose**: Creates unique cache entries for different parameter combinations

### Conditional Queries
**File**: `src/hooks/useTips.ts`  
**Lines**: 44-45

```typescript
enabled: !!address,
```

**Purpose**: Prevents queries from running without required data

---

## Integration with Wagmi

TanStack Query works seamlessly alongside Wagmi's built-in React Query usage:

1. **Complementary Caching**: Custom queries cache application data while Wagmi caches blockchain data
2. **Shared QueryClient**: Both systems use the same QueryClient instance for coordination
3. **Invalidation Coordination**: Custom queries can invalidate Wagmi queries and vice versa
4. **Unified Error Handling**: Consistent error patterns across both systems

## Conclusion

This implementation demonstrates advanced TanStack Query patterns that significantly enhance the user experience of a Web3 application:

- **Performance**: Intelligent caching and background updates
- **Reliability**: Comprehensive error handling and retry logic
- **User Experience**: Optimistic updates and real-time data
- **Maintainability**: Organized hooks and reusable patterns
- **Scalability**: Efficient data management for large applications

The patterns shown here are production-ready and demonstrate best practices for building sophisticated React applications with TanStack Query.