"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { USWiresProvider, useUSWiresContext } from "./contexts/us-wires-context"
import { IndiaPaymentProvider, useIndiaPaymentContext } from "./contexts/india-payment-context"
import { CardPaymentsProvider, useCardPaymentsContext } from "./contexts/card-payments-context"
import { useFlowContext } from "./flow-context-provider"

interface UnifiedSearchContext {
  searchByAll: (criteria: {
    transactionId?: string
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }) => Promise<void>
  clear: () => void
  isFetching: boolean
  currentFlowName: string
  supportedCurrencies: string[]
  matchedAitIds: Set<string>
  hasResults: boolean
}

const MultiContextSearchContext = createContext<UnifiedSearchContext | null>(null)

function ContextSelector({ children }: { children: ReactNode }) {
  const flowContext = useFlowContext()

  const usWiresContext = useUSWiresContext()
  const indiaContext = useIndiaPaymentContext()
  const cardContext = useCardPaymentsContext()

  const activeContext = useMemo((): UnifiedSearchContext => {
    const currentFlow = flowContext?.currentFlow || {
      type: "us_wires",
      name: "US Wires",
      supportedCurrencies: ["USD"],
    }

    const supportedCurrencies = Array.isArray(currentFlow.supportedCurrencies)
      ? currentFlow.supportedCurrencies
      : ["USD"]

    const defaultSearchByAll = async () => {
      console.warn("[v0] Search function not available - context not initialized")
    }
    const defaultClear = () => {
      console.warn("[v0] Clear function not available - context not initialized")
    }

    switch (currentFlow.type) {
      case "us_wires":
        return {
          searchByAll: usWiresContext?.searchByAll || defaultSearchByAll,
          clear: usWiresContext?.clear || defaultClear,
          isFetching: usWiresContext?.isFetching || false,
          currentFlowName: currentFlow.name || "US Wires",
          supportedCurrencies,
          matchedAitIds: usWiresContext?.matchedAitIds || new Set<string>(),
          hasResults: usWiresContext?.hasResults || false,
        }
      case "india_payment":
        return {
          searchByAll: indiaContext?.searchByAll || defaultSearchByAll,
          clear: indiaContext?.clear || defaultClear,
          isFetching: indiaContext?.isFetching || false,
          currentFlowName: currentFlow.name || "India Payment",
          supportedCurrencies,
          matchedAitIds: indiaContext?.matchedAitIds || new Set<string>(),
          hasResults: indiaContext?.hasResults || false,
        }
      case "card_payments":
        return {
          searchByAll: cardContext?.searchByAll || defaultSearchByAll,
          clear: cardContext?.clear || defaultClear,
          isFetching: cardContext?.isFetching || false,
          currentFlowName: currentFlow.name || "Card Payments",
          supportedCurrencies,
          matchedAitIds: cardContext?.matchedAitIds || new Set<string>(),
          hasResults: cardContext?.hasResults || false,
        }
      default:
        return {
          searchByAll: usWiresContext?.searchByAll || defaultSearchByAll,
          clear: usWiresContext?.clear || defaultClear,
          isFetching: usWiresContext?.isFetching || false,
          currentFlowName: currentFlow.name || "US Wires",
          supportedCurrencies,
          matchedAitIds: usWiresContext?.matchedAitIds || new Set<string>(),
          hasResults: usWiresContext?.hasResults || false,
        }
    }
  }, [flowContext?.currentFlow, usWiresContext, indiaContext, cardContext])

  return <MultiContextSearchContext.Provider value={activeContext}>{children}</MultiContextSearchContext.Provider>
}

export function MultiContextSearchProvider({ children }: { children: ReactNode }) {
  return (
    <USWiresProvider>
      <IndiaPaymentProvider>
        <CardPaymentsProvider>
          <ContextSelector>{children}</ContextSelector>
        </CardPaymentsProvider>
      </IndiaPaymentProvider>
    </USWiresProvider>
  )
}

export function useMultiContextSearch(): UnifiedSearchContext {
  const context = useContext(MultiContextSearchContext)
  if (!context) {
    console.warn("[v0] useMultiContextSearch used outside of MultiContextSearchProvider, providing fallback")
    return {
      searchByAll: async () => console.warn("[v0] Search not available - provider not found"),
      clear: () => console.warn("[v0] Clear not available - provider not found"),
      isFetching: false,
      currentFlowName: "US Wires",
      supportedCurrencies: ["USD"],
      matchedAitIds: new Set<string>(),
      hasResults: false,
    }
  }
  return context
}
