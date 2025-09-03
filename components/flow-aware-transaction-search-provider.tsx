"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import { useFlowContext } from "@/components/flow-context-provider"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface SearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}

type FlowAwareTransactionSearchContextValue = {
  active: boolean
  id: string
  searchParams: SearchParams
  results?: SplunkTransactionDetails
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error
  invalidId: boolean
  notFound: boolean
  search: (id: string) => void
  searchByAll: (params: SearchParams) => void
  clear: () => void
  // Flow-aware features
  matchedAitIds: Set<string>
  flowFilteredResults?: SplunkTransactionDetails
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
  isTableLoading: boolean
  // Flow context info
  currentFlowName: string
  supportedCurrencies: string[]
}

const FlowAwareTransactionSearchContext = createContext<FlowAwareTransactionSearchContextValue | null>(null)

export function FlowAwareTransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(false)

  const { flowConfig } = useFlowContext()
  const tx = useTransactionSearch({})

  console.log("[v0] Flow-aware search provider initialized:", {
    currentFlow: flowConfig.id,
    flowName: flowConfig.name,
    dataFilters: flowConfig.dataFilters,
  })

  const search = useCallback(
    (id: string) => {
      if (!id) return
      console.log("[v0] Initiating flow-aware search:", { id, flow: flowConfig.id })
      tx.searchById(id)
    },
    [tx, flowConfig.id],
  )

  const searchByAll = useCallback(
    (params: SearchParams) => {
      console.log("[v0] Initiating flow-aware search by all params:", { params, flow: flowConfig.id })
      tx.searchByAll(params)
    },
    [tx, flowConfig.id],
  )

  const clear = useCallback(() => {
    console.log("[v0] Clearing flow-aware search:", { flow: flowConfig.id })
    setShowTableView(false)
    setSelectedAitId(null)
    setIsTableLoading(false)
    tx.reset()
  }, [tx, flowConfig.id])

  const flowFilteredResults = useMemo(() => {
    if (!tx.results?.length) return undefined

    const filtered = tx.results.filter((result) => {
      // Filter by source types if configured
      if (flowConfig.dataFilters?.sourceTypes?.length) {
        const sourceType = result.sourceType?.toLowerCase() || ""
        const matchesSourceType = flowConfig.dataFilters.sourceTypes.some((type) =>
          sourceType.includes(type.toLowerCase()),
        )
        if (!matchesSourceType) return false
      }

      // Filter by AIT patterns if configured
      if (flowConfig.dataFilters?.aitPatterns?.length && result.aitNumber) {
        const matchesAitPattern = flowConfig.dataFilters.aitPatterns.some((pattern) => {
          const regex = new RegExp(pattern.replace("*", ".*"), "i")
          return regex.test(result.aitNumber || "")
        })
        if (!matchesAitPattern) return false
      }

      // Filter by country code if configured
      if (flowConfig.dataFilters?.countryCode && flowConfig.dataFilters.countryCode !== "MULTI") {
        const countryCode =
          result._raw?.TPP_CNTRY_CODE || result._raw?.TPP_BANK_CNTRY_CODE || result._raw?.XQQ_CUST_CNTRY_CODE
        if (countryCode && countryCode !== flowConfig.dataFilters.countryCode) return false
      }

      return true
    })

    console.log("[v0] Flow filtering results:", {
      flow: flowConfig.id,
      originalCount: tx.results.length,
      filteredCount: filtered.length,
      filters: flowConfig.dataFilters,
    })

    return filtered
  }, [tx.results, flowConfig])

  const active = useMemo(() => {
    const hasSearchParams = !!(
      tx.searchParams.transactionId ||
      tx.searchParams.transactionAmount ||
      tx.searchParams.dateStart ||
      tx.searchParams.dateEnd
    )
    return hasSearchParams && (tx.isLoading || tx.isFetching || !!flowFilteredResults?.length)
  }, [tx.searchParams, tx.isLoading, tx.isFetching, flowFilteredResults])

  const showTable = useCallback(
    (aitId: string) => {
      console.log("[v0] Showing table for AIT ID:", { aitId, flow: flowConfig.id })
      setIsTableLoading(true)
      setSelectedAitId(aitId)

      requestAnimationFrame(() => {
        setShowTableView(true)
        setTimeout(() => {
          setIsTableLoading(false)
        }, 100)
      })
    },
    [flowConfig.id],
  )

  const hideTable = useCallback(() => {
    console.log("[v0] Hiding table:", { flow: flowConfig.id })
    setIsTableLoading(false)
    setShowTableView(false)
    setSelectedAitId(null)
  }, [flowConfig.id])

  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!active || !flowFilteredResults?.length) {
      return set
    }

    for (const detail of flowFilteredResults) {
      if (detail?.aitNumber) {
        set.add(detail.aitNumber)
      }
      if (detail?._raw?.AIT_NUMBER) {
        set.add(detail._raw.AIT_NUMBER)
      }
    }

    console.log("[v0] Matched AIT IDs for flow:", {
      flow: flowConfig.id,
      aitIds: Array.from(set),
    })

    return set
  }, [active, flowFilteredResults, flowConfig.id])

  const value = useMemo<FlowAwareTransactionSearchContextValue>(() => {
    return {
      active,
      id: tx.id,
      searchParams: tx.searchParams,
      results: tx.results, // Keep original results for compatibility
      flowFilteredResults, // New: flow-specific filtered results
      isLoading: tx.isLoading,
      isFetching: tx.isFetching,
      isError: tx.isError,
      error: tx.error,
      invalidId: tx.invalidId,
      notFound: tx.notFound,
      search,
      searchByAll,
      clear,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
      isTableLoading,
      // Flow context info
      currentFlowName: flowConfig.name,
      supportedCurrencies: flowConfig.currency || ["USD"],
    }
  }, [
    active,
    tx,
    flowFilteredResults,
    search,
    searchByAll,
    clear,
    matchedAitIds,
    showTableView,
    selectedAitId,
    showTable,
    hideTable,
    isTableLoading,
    flowConfig,
  ])

  return (
    <FlowAwareTransactionSearchContext.Provider value={value}>{children}</FlowAwareTransactionSearchContext.Provider>
  )
}

export function useFlowAwareTransactionSearchContext() {
  const ctx = useContext(FlowAwareTransactionSearchContext)
  if (!ctx) {
    throw new Error("useFlowAwareTransactionSearchContext must be used within FlowAwareTransactionSearchProvider")
  }
  return ctx
}
