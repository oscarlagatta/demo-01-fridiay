"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface CardPaymentsSearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}

interface CardPaymentsContextValue {
  // Search functionality
  active: boolean
  searchParams: CardPaymentsSearchParams
  results?: SplunkTransactionDetails
  isLoading: boolean
  isError: boolean
  search: (id: string) => void
  searchByAll: (params: CardPaymentsSearchParams) => void
  clear: () => void

  // Card Payments specific features
  matchedAitIds: Set<string>
  filteredResults?: SplunkTransactionDetails
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
  supportedCurrencies: string[]
  cardTypes: string[]
}

const CardPaymentsContext = createContext<CardPaymentsContextValue | null>(null)

export function CardPaymentsProvider({ children }: { children: React.ReactNode }) {
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)

  const tx = useTransactionSearch({})

  const filteredResults = useMemo(() => {
    if (!tx.results?.length) return undefined

    const filtered = tx.results.filter((result) => {
      // Filter for Card Payment specific source types
      const sourceType = result.sourceType?.toLowerCase() || ""
      const isCardPayment =
        sourceType.includes("card_payment") ||
        sourceType.includes("visa") ||
        sourceType.includes("mastercard") ||
        sourceType.includes("amex")

      // Filter for Card AIT patterns
      if (result.aitNumber) {
        const matchesCardPattern = /^(CARD_|VISA_|MC_)/i.test(result.aitNumber)
        if (!matchesCardPattern) return false
      }

      return isCardPayment
    })

    console.log("[v0] Card Payments filtering:", {
      originalCount: tx.results.length,
      filteredCount: filtered.length,
    })

    return filtered
  }, [tx.results])

  const search = useCallback(
    (id: string) => {
      if (!id) return
      console.log("[v0] Card Payments search:", { id })
      tx.searchById(id)
    },
    [tx],
  )

  const searchByAll = useCallback(
    (params: CardPaymentsSearchParams) => {
      console.log("[v0] Card Payments search by all:", { params })
      tx.searchByAll(params)
    },
    [tx],
  )

  const clear = useCallback(() => {
    console.log("[v0] Card Payments clear")
    setShowTableView(false)
    setSelectedAitId(null)
    tx.reset()
  }, [tx])

  const showTable = useCallback((aitId: string) => {
    console.log("[v0] Card Payments show table:", { aitId })
    setSelectedAitId(aitId)
    setShowTableView(true)
  }, [])

  const hideTable = useCallback(() => {
    console.log("[v0] Card Payments hide table")
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

  const value = useMemo<CardPaymentsContextValue>(
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
      supportedCurrencies: ["USD", "EUR", "GBP"],
      cardTypes: ["visa", "mastercard", "amex"],
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

  return <CardPaymentsContext.Provider value={value}>{children}</CardPaymentsContext.Provider>
}

export function useCardPaymentsContext() {
  const context = useContext(CardPaymentsContext)
  if (!context) {
    throw new Error("useCardPaymentsContext must be used within CardPaymentsProvider")
  }
  return context
}
