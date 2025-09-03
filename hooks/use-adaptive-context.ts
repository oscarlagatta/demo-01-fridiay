import { useTransactionSearchContext } from "./use-transaction-search"
import { useUSWiresSearch } from "../components/contexts/us-wires-context"
import { useIndiaPaymentSearch } from "../components/contexts/india-payment-context"
import { useCardPaymentSearch } from "../components/contexts/card-payments-context"

export type FlowType = "US_WIRES" | "INDIA_PAYMENT" | "CARD_PAYMENTS" | "GLOBAL"

// Adaptive hook that can use specific or global context
export const useAdaptiveTransactionSearch = (preferredFlow?: FlowType) => {
  // Get all available contexts
  const globalContext = useTransactionSearchContext()
  const usWiresContext = useUSWiresSearch()
  const indiaContext = useIndiaPaymentSearch()
  const cardContext = useCardPaymentSearch()

  // Smart context selection
  const selectContext = () => {
    switch (preferredFlow) {
      case "US_WIRES":
        return usWiresContext || globalContext
      case "INDIA_PAYMENT":
        return indiaContext || globalContext
      case "CARD_PAYMENTS":
        return cardContext || globalContext
      case "GLOBAL":
      default:
        return globalContext
    }
  }

  const selectedContext = selectContext()

  return {
    ...selectedContext,
    // Additional metadata
    contextType: preferredFlow || "GLOBAL",
    isSpecificContext: selectedContext !== globalContext,
    availableContexts: {
      global: !!globalContext,
      usWires: !!usWiresContext,
      india: !!indiaContext,
      card: !!cardContext,
    },
  }
}

// Hook for components that need multiple contexts
export const useMultiFlowAccess = () => {
  const global = useTransactionSearchContext()

  // Safely try to access specific contexts
  const getContextSafely = (contextHook: () => any) => {
    try {
      return contextHook()
    } catch {
      return null
    }
  }

  return {
    global,
    usWires: getContextSafely(useUSWiresSearch),
    india: getContextSafely(useIndiaPaymentSearch),
    card: getContextSafely(useCardPaymentSearch),

    // Helper to get active contexts
    getActiveContexts: () => {
      const contexts = []
      if (global) contexts.push({ type: "GLOBAL", context: global })

      const specific = [
        { type: "US_WIRES", hook: useUSWiresSearch },
        { type: "INDIA_PAYMENT", hook: useIndiaPaymentSearch },
        { type: "CARD_PAYMENTS", hook: useCardPaymentSearch },
      ]

      specific.forEach(({ type, hook }) => {
        const ctx = getContextSafely(hook)
        if (ctx) contexts.push({ type, context: ctx })
      })

      return contexts
    },
  }
}
