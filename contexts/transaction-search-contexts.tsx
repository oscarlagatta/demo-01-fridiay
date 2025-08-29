"use client"

import type React from "react"
import { useMemo } from "react"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import {
  createBaseSearchContext,
  createBaseSearchProvider,
  type BaseSearchParams,
  type BaseSearchResult,
} from "./base-search-context"
import { createBaseUIContext, createBaseUIProvider } from "./base-ui-context"

// Transaction-specific search parameters
export interface TransactionSearchParams extends BaseSearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}

// Transaction-specific result type
export interface TransactionSearchResult extends BaseSearchResult {
  id: string
  source?: string
  sourceType?: string
  aitNumber?: string
  aitName?: string
  _raw?: any
}

// US Wires specific context
const { Context: UsWiresSearchContext, useContext: useUsWiresSearchContext } = createBaseSearchContext<
  TransactionSearchParams,
  TransactionSearchResult
>()

const { Context: UsWiresUIContext, useContext: useUsWiresUIContext } = createBaseUIContext()

const UsWiresSearchProvider = createBaseSearchProvider(UsWiresSearchContext)
const UsWiresUIProvider = createBaseUIProvider(UsWiresUIContext)

// Combined US Wires provider
export function UsWiresTransactionProvider({ children }: { children: React.ReactNode }) {
  const searchHook = useTransactionSearch({})

  // US Wires specific transformations
  const transformResults = useMemo(
    () =>
      (rawResults: SplunkTransactionDetails): TransactionSearchResult[] => {
        return rawResults.map((detail) => ({
          id: detail.aitNumber || detail._raw?.AIT_NUMBER || Math.random().toString(),
          source: detail.source,
          sourceType: detail.sourceType,
          aitNumber: detail.aitNumber,
          aitName: detail.aitName,
          _raw: detail._raw,
        }))
      },
    [],
  )

  const computeActive = useMemo(
    () => (params: TransactionSearchParams, results?: TransactionSearchResult[]) => {
      const hasSearchParams = !!(params.transactionId || params.transactionAmount || params.dateStart || params.dateEnd)
      return hasSearchParams && (searchHook.isLoading || searchHook.isFetching || !!results?.length)
    },
    [searchHook.isLoading, searchHook.isFetching],
  )

  const extractIds = useMemo(
    () => (results: TransactionSearchResult[]) => {
      const set = new Set<string>()
      results.forEach((result) => {
        if (result.aitNumber) set.add(result.aitNumber)
        if (result._raw?.AIT_NUMBER) set.add(result._raw.AIT_NUMBER)
      })
      return set
    },
    [],
  )

  return (
    <UsWiresSearchProvider
      searchHook={searchHook}
      transformResults={transformResults}
      computeActive={computeActive}
      extractIds={extractIds}
    >
      <UsWiresUIProvider>{children}</UsWiresUIProvider>
    </UsWiresSearchProvider>
  )
}

// Combined context hook for US Wires
export function useUsWiresTransactionContext() {
  const searchContext = useUsWiresSearchContext()
  const uiContext = useUsWiresUIContext()

  return {
    // Search context
    ...searchContext,
    // UI context
    ...uiContext,
    // Legacy compatibility
    id: searchContext.searchParams.transactionId || "",
    matchedAitIds: searchContext.matchedIds,
    search: (id: string) => searchContext.search({ transactionId: id }),
    searchByAll: (params: TransactionSearchParams) => searchContext.search(params),
  }
}

// India context (example of extending the base)
const { Context: IndiaSearchContext, useContext: useIndiaSearchContext } = createBaseSearchContext<
  TransactionSearchParams,
  TransactionSearchResult
>()

const { Context: IndiaUIContext, useContext: useIndiaUIContext } = createBaseUIContext()

const IndiaSearchProvider = createBaseSearchProvider(IndiaSearchContext)
const IndiaUIProvider = createBaseUIProvider(IndiaUIContext)

export function IndiaTransactionProvider({ children }: { children: React.ReactNode }) {
  // This would use a different hook for India-specific API
  const searchHook = useTransactionSearch({}) // Replace with useIndiaTransactionSearch

  // India-specific transformations
  const transformResults = useMemo(
    () =>
      (rawResults: any): TransactionSearchResult[] => {
        // India-specific transformation logic
        return rawResults.map((detail: any) => ({
          id: detail.referenceId || Math.random().toString(),
          source: detail.source,
          sourceType: detail.sourceType,
          aitNumber: detail.systemId,
          aitName: detail.systemName,
          _raw: detail.rawData,
        }))
      },
    [],
  )

  return (
    <IndiaSearchProvider searchHook={searchHook} transformResults={transformResults}>
      <IndiaUIProvider>{children}</IndiaUIProvider>
    </IndiaSearchProvider>
  )
}

export function useIndiaTransactionContext() {
  const searchContext = useIndiaSearchContext()
  const uiContext = useIndiaUIContext()

  return {
    ...searchContext,
    ...uiContext,
    // India-specific adaptations
    id: searchContext.searchParams.transactionId || "",
    matchedSystemIds: searchContext.matchedIds,
  }
}
