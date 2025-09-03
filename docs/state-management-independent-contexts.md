# State Management and Interactions in Independent Contexts

## Overview
Managing state and interactions within independent contexts requires careful consideration of performance, data consistency, and user experience. This guide outlines best practices for maintaining optimal performance and responsiveness.

## State Management Patterns

### 1. Context-Specific State Isolation

Each independent context should manage its own state without interfering with others:

\`\`\`typescript
// Example: US Wires Context State Management
interface USWiresState {
  searchResults: TransactionResult[];
  isLoading: boolean;
  error: string | null;
  filters: USWiresFilters;
  cache: Map<string, CachedResult>;
}

const useUSWiresState = () => {
  const [state, setState] = useState<USWiresState>({
    searchResults: [],
    isLoading: false,
    error: null,
    filters: defaultUSWiresFilters,
    cache: new Map()
  });
  
  // Context-specific state updates
  const updateSearchResults = useCallback((results: TransactionResult[]) => {
    setState(prev => ({ ...prev, searchResults: results }));
  }, []);
  
  return { state, updateSearchResults };
};
\`\`\`

### 2. Memoization for Performance

Use React's memoization hooks to prevent unnecessary re-renders:

\`\`\`typescript
const contextValue = useMemo(() => ({
  searchResults: state.searchResults,
  isLoading: state.isLoading,
  searchByTransactionId: memoizedSearchById,
  searchByAmount: memoizedSearchByAmount,
  clearResults: memoizedClearResults
}), [state.searchResults, state.isLoading, memoizedSearchById]);
\`\`\`

### 3. Selective State Updates

Implement granular state updates to minimize re-renders:

\`\`\`typescript
const useSelectiveUpdates = () => {
  const [searchState, setSearchState] = useState({});
  const [uiState, setUIState] = useState({});
  
  // Only update search-related state
  const updateSearchState = useCallback((updates) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Only update UI-related state
  const updateUIState = useCallback((updates) => {
    setUIState(prev => ({ ...prev, ...updates }));
  }, []);
  
  return { searchState, uiState, updateSearchState, updateUIState };
};
\`\`\`

## Performance Optimization Techniques

### 1. Lazy Context Initialization

Initialize contexts only when needed to reduce initial bundle size:

\`\`\`typescript
const LazyUSWiresProvider = lazy(() => import('./contexts/us-wires-context'));
const LazyIndiaProvider = lazy(() => import('./contexts/india-context'));

const ConditionalContextProvider = ({ flowType, children }) => {
  const ContextProvider = useMemo(() => {
    switch (flowType) {
      case 'us-wires': return LazyUSWiresProvider;
      case 'india': return LazyIndiaProvider;
      default: return Fragment;
    }
  }, [flowType]);
  
  return (
    <Suspense fallback={<ContextLoadingSpinner />}>
      <ContextProvider>{children}</ContextProvider>
    </Suspense>
  );
};
\`\`\`

### 2. Request Deduplication

Prevent duplicate API calls across contexts:

\`\`\`typescript
const requestCache = new Map<string, Promise<any>>();

const useDedupedRequest = (key: string, requestFn: () => Promise<any>) => {
  return useCallback(async () => {
    if (requestCache.has(key)) {
      return requestCache.get(key);
    }
    
    const promise = requestFn();
    requestCache.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up cache after request completes
      setTimeout(() => requestCache.delete(key), 5000);
    }
  }, [key, requestFn]);
};
\`\`\`

### 3. Background Data Prefetching

Prefetch data for likely-to-be-used contexts:

\`\`\`typescript
const useContextPrefetching = (currentFlow: string) => {
  useEffect(() => {
    const prefetchRelatedFlows = async () => {
      const relatedFlows = getRelatedFlows(currentFlow);
      
      relatedFlows.forEach(flow => {
        // Prefetch critical data for related flows
        prefetchFlowData(flow);
      });
    };
    
    // Prefetch after a delay to not interfere with current operations
    const timeoutId = setTimeout(prefetchRelatedFlows, 2000);
    return () => clearTimeout(timeoutId);
  }, [currentFlow]);
};
\`\`\`

## Interaction Management

### 1. Cross-Context Communication

Implement a lightweight event system for cross-context communication:

\`\`\`typescript
class ContextEventBus {
  private listeners = new Map<string, Set<Function>>();
  
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => this.listeners.get(event)?.delete(callback);
  }
  
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

const eventBus = new ContextEventBus();

// Usage in context
const useContextCommunication = () => {
  const notifyOtherContexts = useCallback((event: string, data: any) => {
    eventBus.emit(event, data);
  }, []);
  
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('search-completed', (data) => {
      // Handle search completion from other contexts
      console.log('Search completed in another context:', data);
    });
    
    return unsubscribe;
  }, []);
  
  return { notifyOtherContexts };
};
\`\`\`

### 2. State Synchronization

Synchronize critical state across contexts when necessary:

\`\`\`typescript
const useCrossContextSync = () => {
  const [syncedState, setSyncedState] = useState({});
  
  useEffect(() => {
    const handleStateSync = (newState: any) => {
      setSyncedState(prev => ({ ...prev, ...newState }));
    };
    
    const unsubscribe = eventBus.subscribe('state-sync', handleStateSync);
    return unsubscribe;
  }, []);
  
  const syncStateToOtherContexts = useCallback((stateUpdate: any) => {
    eventBus.emit('state-sync', stateUpdate);
  }, []);
  
  return { syncedState, syncStateToOtherContexts };
};
\`\`\`

## Responsiveness Strategies

### 1. Progressive Loading

Load context data progressively to maintain UI responsiveness:

\`\`\`typescript
const useProgressiveLoading = () => {
  const [loadingStages, setLoadingStages] = useState({
    critical: false,
    secondary: false,
    optional: false
  });
  
  useEffect(() => {
    const loadData = async () => {
      // Load critical data first
      setLoadingStages(prev => ({ ...prev, critical: true }));
      await loadCriticalData();
      setLoadingStages(prev => ({ ...prev, critical: false }));
      
      // Load secondary data
      setLoadingStages(prev => ({ ...prev, secondary: true }));
      await loadSecondaryData();
      setLoadingStages(prev => ({ ...prev, secondary: false }));
      
      // Load optional data in background
      setTimeout(async () => {
        setLoadingStages(prev => ({ ...prev, optional: true }));
        await loadOptionalData();
        setLoadingStages(prev => ({ ...prev, optional: false }));
      }, 100);
    };
    
    loadData();
  }, []);
  
  return loadingStages;
};
\`\`\`

### 2. Optimistic Updates

Implement optimistic updates for better perceived performance:

\`\`\`typescript
const useOptimisticUpdates = () => {
  const [optimisticState, setOptimisticState] = useState({});
  const [actualState, setActualState] = useState({});
  
  const performOptimisticUpdate = useCallback(async (
    optimisticData: any,
    actualUpdateFn: () => Promise<any>
  ) => {
    // Apply optimistic update immediately
    setOptimisticState(optimisticData);
    
    try {
      // Perform actual update
      const result = await actualUpdateFn();
      setActualState(result);
      setOptimisticState({}); // Clear optimistic state
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticState({});
      throw error;
    }
  }, []);
  
  return { 
    currentState: { ...actualState, ...optimisticState },
    performOptimisticUpdate 
  };
};
\`\`\`

### 3. Debounced Operations

Debounce expensive operations to improve responsiveness:

\`\`\`typescript
const useDebouncedSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, delay]);
  
  return { searchTerm, setSearchTerm, debouncedTerm };
};
\`\`\`

## Best Practices Summary

### Performance Guidelines
1. **Minimize Context Re-renders**: Use memoization and selective updates
2. **Lazy Load Contexts**: Initialize only when needed
3. **Cache Strategically**: Implement intelligent caching with TTL
4. **Debounce Expensive Operations**: Prevent excessive API calls
5. **Use Background Processing**: Offload non-critical operations

### State Management Guidelines
1. **Keep Contexts Isolated**: Avoid tight coupling between contexts
2. **Use Event-Driven Communication**: Implement loose coupling for cross-context interactions
3. **Implement Fallback Mechanisms**: Ensure graceful degradation
4. **Monitor Performance**: Track context performance metrics
5. **Clean Up Resources**: Properly dispose of subscriptions and timers

### Responsiveness Guidelines
1. **Progressive Enhancement**: Load critical features first
2. **Optimistic Updates**: Provide immediate feedback
3. **Error Boundaries**: Isolate context failures
4. **Loading States**: Provide clear loading indicators
5. **Graceful Degradation**: Maintain functionality when contexts fail

This approach ensures that independent contexts maintain high performance while providing a responsive user experience across all flow types.
