"use client"

import type React from "react"
import { UsWiresTransactionProvider, useUsWiresTransactionContext } from "@/contexts/transaction-search-contexts"

// Legacy provider - now just wraps the new architecture
export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  return <UsWiresTransactionProvider>{children}</UsWiresTransactionProvider>
}

// Legacy hook - maintains exact same interface for backward compatibility
export function useTransactionSearchContext() {
  return useUsWiresTransactionContext()
}
