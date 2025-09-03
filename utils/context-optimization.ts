"use client"

// Utility for creating optimized context values
export const useOptimizedContextValue = <T>(
  value: T,
  dependencies: React.DependencyList
): T => {\
  return useMemo(() => value, dependencies);
};

// Utility for debouncing context operations\
export const useContextDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {\
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {\
    if (timeoutRef.current) {\
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {\
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
};

// Utility for context state batching
export const useStateBatcher = () => {\
  const batchedUpdates = useRef<(() => void)[]>([]);\
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updateFn: () => void) => {\
    batchedUpdates.current.push(updateFn);

    if (timeoutRef.current) {\
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Execute all batched updates\
      batchedUpdates.current.forEach(update => update());
      batchedUpdates.current = [];
    }, 16); // Next frame
  }, []);

  return { batchUpdate };
};

// Context cache utility
export class ContextCache<T> {\
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  set(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl\
    });
  }

  get(key: string): T | null {\
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {\
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {\
    this.cache.clear();
  }

  size(): number {\
    return this.cache.size;
  }\
}
