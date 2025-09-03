"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useRegionSpecificTransactionSearch } from "@/hooks/use-region-specific-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface IndiaPaymentSearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}

interface IndiaPaymentContextValue {
  // Search functionality
  active: boolean
  searchParams: IndiaPaymentSearchParams
  results?: SplunkTransactionDetails
  isLoading: boolean
  isError: boolean
  search: (id: string) => void
  searchByAll: (params: IndiaPaymentSearchParams) => void
  clear: () => void

  // India Payment specific features
  matchedAitIds: Set<string>
  filteredResults?: SplunkTransactionDetails
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
  supportedCurrencies: string[]
}

const IndiaPaymentContext = createContext<IndiaPaymentContextValue | null>(null)

export function IndiaPaymentProvider({ children }: { children: React.ReactNode }) {
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)

  const tx = useRegionSpecificTransactionSearch("india", {})

  const filteredResults = tx.results

  const search = useCallback(
    (id: string) => {
      if (!id) return
      console.log("[v0] India Payment search:", { id })
      tx.searchById(id)
    },
    [tx],
  )

  const searchByAll = useCallback(
    (params: IndiaPaymentSearchParams) => {
      console.log("[v0] India Payment search by all:", { params })
      tx.searchByAll(params)
    },
    [tx],
  )

  const clear = useCallback(() => {
    console.log("[v0] India Payment clear")
    setShowTableView(false)
    setSelectedAitId(null)
    tx.reset()
  }, [tx])

  const showTable = useCallback((aitId: string) => {
    console.log("[v0] India Payment show table:", { aitId })
    setSelectedAitId(aitId)
    setShowTableView(true)
  }, [])

  const hideTable = useCallback(() => {
    console.log("[v0] India Payment hide table")
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!filteredResults?.length) return set

    for (const detail of filteredResults) {
      if (detail?.aitNumber) {
        set.add(detail.aitNumber)
      }
    }
    return set
  }, [filteredResults])

  const active = useMemo(() => {
    const hasSearchParams = !!(
      tx.searchParams.transactionId ||
      tx.searchParams.transactionAmount ||
      tx.searchParams.dateStart ||
      tx.searchParams.dateEnd
    )
    return hasSearchParams && (tx.isLoading || !!filteredResults?.length)
  }, [tx.searchParams, tx.isLoading, filteredResults])

  const value = useMemo<IndiaPaymentContextValue>(
    () => ({
      active,
      searchParams: tx.searchParams,
      results: tx.results,
      filteredResults,
      isLoading: tx.isLoading,
      isError: tx.isError,
      search,
      searchByAll,
      clear,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
      supportedCurrencies: ["INR"],
    }),
    [
      active,
      tx.searchParams,
      tx.results,
      filteredResults,
      tx.isLoading,
      tx.isError,
      search,
      searchByAll,
      clear,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
    ],
  )

  return <IndiaPaymentContext.Provider value={value}>{children}</IndiaPaymentContext.Provider>
}

export function useIndiaPaymentContext() {
  const context = useContext(IndiaPaymentContext)
  if (!context) {
    throw new Error("useIndiaPaymentContext must be used within IndiaPaymentProvider")
  }
  return context
}
