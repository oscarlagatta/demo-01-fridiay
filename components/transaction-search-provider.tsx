"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface SearchParams {
  transactionId?: string
  transactionAmount?: string // Added transactionAmount to SearchParams interface
  dateStart?: string
  dateEnd?: string
}

type TransactionSearchContextValue = {
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
  // New: the set of AIT IDs that have data for the active transaction
  matchedAitIds: Set<string>
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
  showAmountSearchResults: boolean
  amountSearchParams: { amount: string; dateStart?: string; dateEnd?: string } | null
  showAmountResults: (amount: string, dateStart?: string, dateEnd?: string) => void
  hideAmountResults: () => void
}

const TransactionSearchContext = createContext<TransactionSearchContextValue | null>(null)

export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)
  const [showAmountSearchResults, setShowAmountSearchResults] = useState(false)
  const [amountSearchParams, setAmountSearchParams] = useState<{
    amount: string
    dateStart?: string
    dateEnd?: string
  } | null>(null)

  const tx = useTransactionSearch({})

  console.log("[v0] Provider tx hook state:", {
    id: tx.id,
    searchParams: tx.searchParams,
    hasResults: !!tx.results,
    resultsLength: tx.results?.length,
    isLoading: tx.isLoading,
    isFetching: tx.isFetching,
    isError: tx.isError,
    error: tx.error,
    results: tx.results,
  })

  const search = useCallback(
    (id: string) => {
      if (!id) return
      console.log("[v0] Provider search called with ID:", id)
      setShowAmountSearchResults(false)
      setAmountSearchParams(null)
      tx.searchById(id)
    },
    [tx],
  )

  const searchByAll = useCallback(
    (params: SearchParams) => {
      console.log("[v0] Provider searchByAll called with params:", params)

      if (params.transactionAmount && !params.transactionId) {
        // This is an amount-only search, show the amount results grid
        setShowAmountSearchResults(true)
        setAmountSearchParams({
          amount: params.transactionAmount,
          dateStart: params.dateStart,
          dateEnd: params.dateEnd,
        })
        setShowTableView(false)
        setSelectedAitId(null)
      } else {
        // Regular search, hide amount results
        setShowAmountSearchResults(false)
        setAmountSearchParams(null)
      }

      tx.searchByAll(params)
    },
    [tx],
  )

  const clear = useCallback(() => {
    setShowTableView(false)
    setSelectedAitId(null)
    setShowAmountSearchResults(false)
    setAmountSearchParams(null)
    tx.reset()
  }, [tx])

  const active = useMemo(() => {
    const hasSearchParams = !!(
      tx.searchParams.transactionId ||
      tx.searchParams.transactionAmount ||
      tx.searchParams.dateStart ||
      tx.searchParams.dateEnd
    )
    const isActive = hasSearchParams && (tx.isLoading || tx.isFetching || !!tx.results?.length)
    console.log("[v0] Provider active calculation:", {
      searchParams: tx.searchParams,
      hasSearchParams,
      isLoading: tx.isLoading,
      isFetching: tx.isFetching,
      hasResults: !!tx.results?.length,
      finalActive: isActive,
    })
    return isActive
  }, [tx.searchParams, tx.isLoading, tx.isFetching, tx.results])

  const showTable = useCallback((aitId: string) => {
    setSelectedAitId(aitId)
    setShowTableView(true)
    setShowAmountSearchResults(false)
  }, [])

  const hideTable = useCallback(() => {
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  const showAmountResults = useCallback((amount: string, dateStart?: string, dateEnd?: string) => {
    setAmountSearchParams({ amount, dateStart, dateEnd })
    setShowAmountSearchResults(true)
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  const hideAmountResults = useCallback(() => {
    setShowAmountSearchResults(false)
    setAmountSearchParams(null)
  }, [])

  console.log("[v0] Provider search state:", {
    active,
    hasResults: !!tx.results?.length,
    resultsCount: tx.results?.length || 0,
    firstResult: tx.results?.[0],
  })

  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!active || !tx.results?.length) {
      console.log("[v0] No matched AIT IDs - active:", active, "results length:", tx.results?.length)
      return set
    }

    console.log("[v0] Processing results for AIT IDs:", tx.results)

    for (const detail of tx.results) {
      console.log("[v0] Processing detail:", detail)
      if (detail?.aitNumber) {
        console.log("[v0] Found aitNumber:", detail.aitNumber)
        set.add(detail.aitNumber)
      }
      if (detail?._raw?.AIT_NUMBER) {
        console.log("[v0] Found _raw.AIT_NUMBER:", detail._raw.AIT_NUMBER)
        set.add(detail._raw.AIT_NUMBER)
      }
    }

    console.log("[v0] Final matchedAitIds:", Array.from(set))
    return set
  }, [active, tx.results])

  const value = useMemo<TransactionSearchContextValue>(() => {
    return {
      active,
      id: tx.id,
      searchParams: tx.searchParams,
      results: tx.results,
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
      showAmountSearchResults,
      amountSearchParams,
      showAmountResults,
      hideAmountResults,
    }
  }, [
    active,
    tx,
    search,
    searchByAll,
    clear,
    matchedAitIds,
    showTableView,
    selectedAitId,
    showTable,
    hideTable,
    showAmountSearchResults,
    amountSearchParams,
    showAmountResults,
    hideAmountResults,
  ])

  return <TransactionSearchContext.Provider value={value}>{children}</TransactionSearchContext.Provider>
}

export function useTransactionSearchContext() {
  const ctx = useContext(TransactionSearchContext)
  if (!ctx) {
    throw new Error("useTransactionSearchContext must be used within TransactionSearchProvider")
  }
  return ctx
}
