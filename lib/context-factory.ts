"use client"

/**
 * Context Factory for Independent Flow Contexts
 * Provides utilities for creating and managing independent contexts
 */

import { createContext, useContext } from "react"
import type { FlowConfiguration } from "./types"

// Base interface for all flow contexts
export interface BaseFlowContext {
  flowType: string
  isLoading: boolean
  error: string | null
  results: any[]
  searchById: (id: string) => Promise<void>
  searchByAmount: (amount: number) => Promise<void>
  clearResults: () => void
  cleanup: () => void
}

// Context factory function
export const createFlowContext = <T extends BaseFlowContext>(flowType: string, config: FlowConfiguration) => {
  const Context = createContext<T | null>(null)

  const useFlowContext = () => {
    const context = useContext(Context)
    if (!context) {
      throw new Error(`use${flowType}Context must be used within ${flowType}Provider`)
    }
    return context
  }

  return { Context, useFlowContext }
}

// Lazy context manager
class ContextManager {
  private contexts = new Map<string, any>()

  getContext<T>(flowType: string, factory: () => T): T {
    if (!this.contexts.has(flowType)) {
      this.contexts.set(flowType, factory())
    }
    return this.contexts.get(flowType)
  }

  cleanup(flowType?: string) {
    if (flowType) {
      const context = this.contexts.get(flowType)
      if (context?.cleanup) {
        context.cleanup()
      }
      this.contexts.delete(flowType)
    } else {
      // Cleanup all contexts
      this.contexts.forEach((context) => {
        if (context?.cleanup) {
          context.cleanup()
        }
      })
      this.contexts.clear()
    }
  }
}

export const contextManager = new ContextManager()

// Smart context selector hook
export const useFlowSpecificContext = (flowType: string) => {
  return contextManager.getContext(flowType, () => {
    // Create context based on flow type
    switch (flowType) {
      case "US_WIRES":
        return createUSWiresContext()
      case "INDIA_PAYMENT":
        return createIndiaPaymentContext()
      case "CARD_PAYMENTS":
        return createCardPaymentContext()
      default:
        throw new Error(`Unknown flow type: ${flowType}`)
    }
  })
}

// Helper functions for creating specific contexts
const createUSWiresContext = () => {
  // Implementation for US Wires context
  return {
    flowType: "US_WIRES",
    // ... other properties
  }
}

const createIndiaPaymentContext = () => {
  // Implementation for India Payment context
  return {
    flowType: "INDIA_PAYMENT",
    // ... other properties
  }
}

const createCardPaymentContext = () => {
  // Implementation for Card Payment context
  return {
    flowType: "CARD_PAYMENTS",
    // ... other properties
  }
}
