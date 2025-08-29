"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useUsWiresTransactionContext } from "./transaction-search-contexts"

// Context type enum
export enum ContextType {
  US_WIRES = "us_wires",
  INDIA = "india",
  GENERIC = "generic",
}

// Context switcher value
interface ContextSwitcherValue {
  currentContext: ContextType
  switchContext: (context: ContextType) => void
  availableContexts: ContextType[]
}

const ContextSwitcherContext = createContext<ContextSwitcherValue | null>(null)

// Context switcher provider
export function ContextSwitcherProvider({ children }: { children: React.ReactNode }) {
  const [currentContext, setCurrentContext] = useState<ContextType>(ContextType.US_WIRES)

  const availableContexts = [ContextType.US_WIRES, ContextType.INDIA, ContextType.GENERIC]

  const switchContext = (context: ContextType) => {
    setCurrentContext(context)
  }

  const value: ContextSwitcherValue = {
    currentContext,
    switchContext,
    availableContexts,
  }

  return <ContextSwitcherContext.Provider value={value}>{children}</ContextSwitcherContext.Provider>
}

export function useContextSwitcher() {
  const context = useContext(ContextSwitcherContext)
  if (!context) {
    throw new Error("useContextSwitcher must be used within ContextSwitcherProvider")
  }
  return context
}

// Universal hook that works with any context
export function useTransactionContext() {
  const switcher = useContextSwitcher()
  const usWiresContext = useUsWiresTransactionContext()

  switch (switcher.currentContext) {
    case ContextType.US_WIRES:
      return usWiresContext
    case ContextType.INDIA:
      // return useIndiaTransactionContext()
      throw new Error("India context not implemented")
    default:
      throw new Error(`Unknown context type: ${switcher.currentContext}`)
  }
}
