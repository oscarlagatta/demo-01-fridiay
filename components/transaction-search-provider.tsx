"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

type TransactionSearchContextValue = {
  active: boolean
  id: string
  results?: SplunkTransactionDetails
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error
  invalidId: boolean
  notFound: boolean
  search: (id: string) => void
  clear: () => void
  // New: the set of AIT IDs that have data for the active transaction
  matchedAitIds: Set<string>
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
}

const TransactionSearchContext = createContext<TransactionSearchContextValue | null>(null)

// Use an invalid default to keep the query disabled until user searches

export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)

  // Initialize hook with invalid default so it doesn't run until a valid search
  const tx = useTransactionSearch("")

  const search = useCallback(
    (id: string) => {
      if (!id) return
      setActive(true)
      tx.search(id)
    },
    [tx],
  )

  const clear = useCallback(() => {
    setActive(false)
    setShowTableView(false)
    setSelectedAitId(null)
    tx.reset("")
  }, [tx])

  const showTable = useCallback((aitId: string) => {
    setSelectedAitId(aitId)
    setShowTableView(true)
  }, [])

  const hideTable = useCallback(() => {
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  // Derive which AIT IDs are relevant to the current transaction search results
  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!active || !tx.results?.length) return set

    for (const detail of tx.results) {
      // Use direct aitNumber from API response
      if (detail?.aitNumber) {
        set.add(detail.aitNumber)
      }
      // Fallback to _raw.AIT_NUMBER if aitNumber is not available at root level
      if (detail?._raw?.AIT_NUMBER) {
        set.add(detail._raw.AIT_NUMBER)
      }
    }
    return set
  }, [active, tx.results])

  const value = useMemo<TransactionSearchContextValue>(() => {
    return {
      active,
      id: tx.id,
      results: tx.results,
      isLoading: tx.isLoading,
      isFetching: tx.isFetching,
      isError: tx.isError,
      error: tx.error,
      invalidId: tx.invalidId,
      notFound: tx.notFound,
      search,
      clear,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
    }
  }, [active, tx, search, clear, matchedAitIds, showTableView, selectedAitId, showTable, hideTable])

  return <TransactionSearchContext.Provider value={value}>{children}</TransactionSearchContext.Provider>
}

export function useTransactionSearchContext() {
  const ctx = useContext(TransactionSearchContext)
  if (!ctx) {
    throw new Error("useTransactionSearchContext must be used within TransactionSearchProvider")
  }
  return ctx
}
