"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface SearchParams {
  transactionId?: string
  transactionAmount?: string
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
  cancel: () => void
  matchedAitIds: Set<string>
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
  isTableLoading: boolean
}

const TransactionSearchContext = createContext<TransactionSearchContextValue | null>(null)

export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(false)

  const tx = useTransactionSearch({})

  const search = useCallback(
    (id: string) => {
      if (!id) return
      tx.searchById(id)
    },
    [tx],
  )

  const searchByAll = useCallback(
    (params: SearchParams) => {
      tx.searchByAll(params)
    },
    [tx],
  )

  const clear = useCallback(() => {
    setShowTableView(false)
    setSelectedAitId(null)
    setIsTableLoading(false)
    tx.reset()
  }, [tx])

  const cancel = useCallback(() => {
    tx.reset()
    setShowTableView(false)
    setSelectedAitId(null)
    setIsTableLoading(false)
  }, [tx])

  const active = useMemo(() => {
    const hasSearchParams = !!(
      tx.searchParams.transactionId ||
      tx.searchParams.transactionAmount ||
      tx.searchParams.dateStart ||
      tx.searchParams.dateEnd
    )
    return hasSearchParams && (tx.isLoading || tx.isFetching || !!tx.results?.length)
  }, [tx.searchParams, tx.isLoading, tx.isFetching, tx.results])

  const showTable = useCallback((aitId: string) => {
    setIsTableLoading(true)
    setSelectedAitId(aitId)

    requestAnimationFrame(() => {
      setShowTableView(true)
      setTimeout(() => {
        setIsTableLoading(false)
      }, 100)
    })
  }, [])

  const hideTable = useCallback(() => {
    setIsTableLoading(false)
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!active || !tx.results?.length) {
      return set
    }

    for (const detail of tx.results) {
      if (detail?.aitNumber) {
        set.add(detail.aitNumber)
      }
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
      cancel,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
      isTableLoading,
    }
  }, [
    active,
    tx,
    search,
    searchByAll,
    clear,
    cancel,
    matchedAitIds,
    showTableView,
    selectedAitId,
    showTable,
    hideTable,
    isTableLoading,
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
