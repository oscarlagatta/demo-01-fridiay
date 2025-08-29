"use client"

import type React from "react"
import { createContext, useContext, useMemo, useCallback } from "react"

// Generic search parameters interface
export interface BaseSearchParams {
  [key: string]: string | undefined
}

// Generic search result interface
export interface BaseSearchResult {
  id: string
  [key: string]: any
}

// Base search context value interface
export interface BaseSearchContextValue<TParams extends BaseSearchParams, TResult extends BaseSearchResult> {
  // Search state
  searchParams: TParams
  results?: TResult[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error
  active: boolean

  // Search operations
  search: (params: Partial<TParams>) => void
  clear: () => void

  // Data processing
  matchedIds: Set<string>

  // Extensibility hooks
  transformResults?: (rawResults: any) => TResult[]
  computeActive?: (params: TParams, results?: TResult[]) => boolean
  extractIds?: (results: TResult[]) => Set<string>
}

// Base search hook interface
export interface BaseSearchHook<TParams extends BaseSearchParams, TResult extends BaseSearchResult> {
  searchParams: TParams
  results?: TResult[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error
  search: (params: Partial<TParams>) => void
  reset: () => void
}

// Generic base search context factory
export function createBaseSearchContext<TParams extends BaseSearchParams, TResult extends BaseSearchResult>() {
  const Context = createContext<BaseSearchContextValue<TParams, TResult> | null>(null)

  return {
    Context,
    useContext: () => {
      const ctx = useContext(Context)
      if (!ctx) {
        throw new Error("useBaseSearchContext must be used within a BaseSearchProvider")
      }
      return ctx
    },
  }
}

// Base search provider props
export interface BaseSearchProviderProps<TParams extends BaseSearchParams, TResult extends BaseSearchResult> {
  children: React.ReactNode
  searchHook: BaseSearchHook<TParams, TResult>
  transformResults?: (rawResults: any) => TResult[]
  computeActive?: (params: TParams, results?: TResult[]) => boolean
  extractIds?: (results: TResult[]) => Set<string>
}

// Generic base search provider factory
export function createBaseSearchProvider<TParams extends BaseSearchParams, TResult extends BaseSearchResult>(
  Context: React.Context<BaseSearchContextValue<TParams, TResult> | null>,
) {
  return function BaseSearchProvider({
    children,
    searchHook,
    transformResults,
    computeActive,
    extractIds,
  }: BaseSearchProviderProps<TParams, TResult>) {
    const defaultComputeActive = useCallback(
      (params: TParams, results?: TResult[]) => {
        const hasSearchParams = Object.values(params).some((value) => !!value)
        return hasSearchParams && (searchHook.isLoading || searchHook.isFetching || !!results?.length)
      },
      [searchHook.isLoading, searchHook.isFetching],
    )

    const defaultExtractIds = useCallback((results: TResult[]) => {
      const set = new Set<string>()
      results.forEach((result) => {
        if (result.id) set.add(result.id)
      })
      return set
    }, [])

    const active = useMemo(() => {
      const computeFn = computeActive || defaultComputeActive
      return computeFn(searchHook.searchParams, searchHook.results)
    }, [searchHook.searchParams, searchHook.results, computeActive, defaultComputeActive])

    const matchedIds = useMemo(() => {
      if (!active || !searchHook.results?.length) return new Set<string>()
      const extractFn = extractIds || defaultExtractIds
      return extractFn(searchHook.results)
    }, [active, searchHook.results, extractIds, defaultExtractIds])

    const value = useMemo<BaseSearchContextValue<TParams, TResult>>(
      () => ({
        searchParams: searchHook.searchParams,
        results: searchHook.results,
        isLoading: searchHook.isLoading,
        isFetching: searchHook.isFetching,
        isError: searchHook.isError,
        error: searchHook.error,
        active,
        search: searchHook.search,
        clear: searchHook.reset,
        matchedIds,
        transformResults,
        computeActive,
        extractIds,
      }),
      [searchHook, active, matchedIds, transformResults, computeActive, extractIds],
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
  }
}
