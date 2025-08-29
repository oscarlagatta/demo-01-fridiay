import { create } from "zustand"
import { devtools, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { TransactionSearchParams, TransactionSearchResult } from "@/contexts/transaction-search-contexts"

// Base store interface
interface BaseTransactionStore {
  // Search state
  searchParams: TransactionSearchParams
  results: TransactionSearchResult[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: string | null

  // UI state
  showTable: boolean
  selectedAitId: string | null
  isTableLoading: boolean

  // Computed state
  active: boolean
  matchedIds: Set<string>

  // Actions
  search: (params: TransactionSearchParams) => Promise<void>
  clear: () => void
  showTableView: () => void
  hideTable: () => void
  setSelectedAitId: (id: string | null) => void
}

// Region-specific store creators
export const createTransactionStore = (region: "us-wires" | "india") => {
  return create<BaseTransactionStore>()(
    devtools(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          searchParams: {},
          results: [],
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
          showTable: false,
          selectedAitId: null,
          isTableLoading: false,

          // Computed state (updated via subscriptions)
          active: false,
          matchedIds: new Set(),

          // Actions
          search: async (params) => {
            set((state) => {
              state.searchParams = { ...state.searchParams, ...params }
              state.isLoading = true
              state.isError = false
              state.error = null
            })

            try {
              // Region-specific API call
              const apiCall = region === "us-wires" ? fetchUsWiresTransactions : fetchIndiaTransactions

              const rawResults = await apiCall(params)

              // Region-specific transformation
              const transformedResults =
                region === "us-wires" ? transformUsWiresResults(rawResults) : transformIndiaResults(rawResults)

              set((state) => {
                state.results = transformedResults
                state.isLoading = false
                state.active = computeActive(state.searchParams, transformedResults)
                state.matchedIds = extractIds(transformedResults)
              })
            } catch (error) {
              set((state) => {
                state.isLoading = false
                state.isError = true
                state.error = error instanceof Error ? error.message : "Unknown error"
              })
            }
          },

          clear: () => {
            set((state) => {
              state.searchParams = {}
              state.results = []
              state.active = false
              state.matchedIds = new Set()
              state.selectedAitId = null
            })
          },

          showTableView: () =>
            set((state) => {
              state.showTable = true
            }),
          hideTable: () =>
            set((state) => {
              state.showTable = false
            }),
          setSelectedAitId: (id) =>
            set((state) => {
              state.selectedAitId = id
            }),
        })),
      ),
      { name: `${region}-transaction-store` },
    ),
  )
}

// Store instances
export const useUsWiresStore = createTransactionStore("us-wires")
export const useIndiaStore = createTransactionStore("india")

// Helper functions (region-specific)
async function fetchUsWiresTransactions(params: TransactionSearchParams) {
  // US Wires API implementation
  return []
}

async function fetchIndiaTransactions(params: TransactionSearchParams) {
  // India API implementation
  return []
}

function transformUsWiresResults(rawResults: any[]): TransactionSearchResult[] {
  return rawResults.map((detail) => ({
    id: detail.aitNumber || Math.random().toString(),
    source: detail.source,
    sourceType: detail.sourceType,
    aitNumber: detail.aitNumber,
    aitName: detail.aitName,
    _raw: detail._raw,
  }))
}

function transformIndiaResults(rawResults: any[]): TransactionSearchResult[] {
  return rawResults.map((detail) => ({
    id: detail.referenceId || Math.random().toString(),
    source: detail.source,
    sourceType: detail.sourceType,
    aitNumber: detail.systemId,
    aitName: detail.systemName,
    _raw: detail.rawData,
  }))
}

function computeActive(params: TransactionSearchParams, results: TransactionSearchResult[]): boolean {
  const hasSearchParams = !!(params.transactionId || params.transactionAmount || params.dateStart || params.dateEnd)
  return hasSearchParams && !!results?.length
}

function extractIds(results: TransactionSearchResult[]): Set<string> {
  const set = new Set<string>()
  results.forEach((result) => {
    if (result.aitNumber) set.add(result.aitNumber)
    if (result._raw?.AIT_NUMBER) set.add(result._raw.AIT_NUMBER)
  })
  return set
}
