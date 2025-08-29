"use client"

import { useTransactionSearchContext } from "./transaction-search-provider"
import { TransactionDetailsTableAgGridFlexible } from "./transaction-details-table-ag-grid-flexible"
import {
  UsWiresTransactionTableAdapter,
  IndiaTransactionTableAdapter,
  BaseTransactionTableAdapter,
} from "@/adapters/transaction-table-adapters"
import type { TransactionTableAdapter } from "@/types/transaction-table-types"

type ContextType = "us-wires" | "india" | "generic"

interface TransactionDetailsTableAgGridProps {
  /** Optional context data to override the default hook-based context */
  contextData?: any
  /** Context type for automatic adapter selection */
  contextType?: ContextType
  /** Custom adapter instance for advanced use cases */
  adapter?: TransactionTableAdapter
  /** Additional CSS classes */
  className?: string
  /** Callback when component encounters an error */
  onError?: (error: Error) => void
}

export function TransactionDetailsTableAgGrid({
  contextData,
  contextType = "us-wires",
  adapter: customAdapter,
  className,
  onError,
}: TransactionDetailsTableAgGridProps = {}) {
  const hookContextData = useTransactionSearchContext()

  const effectiveContextData = contextData || hookContextData

  if (!effectiveContextData) {
    const error = new Error(
      "No context data available. Either provide contextData prop or ensure TransactionSearchProvider is available.",
    )
    onError?.(error)
    console.error("[v0] TransactionDetailsTableAgGrid:", error.message)
    return (
      <div className={`w-full p-6 text-center ${className}`}>
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Configuration Error</h3>
          <p className="text-sm">No transaction context available. Please check your component setup.</p>
        </div>
      </div>
    )
  }

  let adapter: TransactionTableAdapter
  try {
    adapter = customAdapter || createAdapterForContextType(effectiveContextData, contextType)
  } catch (error) {
    const adapterError = new Error(`Failed to create adapter for context type '${contextType}': ${error}`)
    onError?.(adapterError)
    console.error("[v0] TransactionDetailsTableAgGrid:", adapterError.message)
    // Fallback to base adapter
    adapter = new BaseTransactionTableAdapter(effectiveContextData)
  }

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} className={className} />
}

function createAdapterForContextType(contextData: any, contextType: ContextType): TransactionTableAdapter {
  if (!contextData) {
    throw new Error("Context data is required to create adapter")
  }

  switch (contextType) {
    case "us-wires":
      return new UsWiresTransactionTableAdapter(contextData)
    case "india":
      return new IndiaTransactionTableAdapter(contextData)
    case "generic":
    default:
      return new BaseTransactionTableAdapter(contextData)
  }
}

export { createAdapterForContextType }

export function UsWiresTransactionDetailsTable(props: Omit<TransactionDetailsTableAgGridProps, "contextType">) {
  return <TransactionDetailsTableAgGrid {...props} contextType="us-wires" />
}

export function IndiaTransactionDetailsTable(props: Omit<TransactionDetailsTableAgGridProps, "contextType">) {
  return <TransactionDetailsTableAgGrid {...props} contextType="india" />
}

export function GenericTransactionDetailsTable(props: Omit<TransactionDetailsTableAgGridProps, "contextType">) {
  return <TransactionDetailsTableAgGrid {...props} contextType="generic" />
}
