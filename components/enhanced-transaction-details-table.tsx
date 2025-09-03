"use client"

import { AGGridTable } from "@/components/hoc/with-ag-grid-table"
import { transactionSearchAdapter } from "@/components/context-adapters/transaction-search-adapter"
import { multiContextAdapter } from "@/components/context-adapters/multi-context-adapter"
import type { AGGridHOCProps } from "@/types/ag-grid-hoc"

interface EnhancedTransactionDetailsTableProps {
  useMultiContext?: boolean
  customConfig?: AGGridHOCProps["config"]
  customFormatter?: AGGridHOCProps["formatter"]
}

export function EnhancedTransactionDetailsTable({
  useMultiContext = false,
  customConfig,
  customFormatter,
}: EnhancedTransactionDetailsTableProps) {
  const contextAdapter = useMultiContext ? multiContextAdapter : transactionSearchAdapter

  return (
    <AGGridTable
      contextAdapter={contextAdapter}
      config={customConfig}
      formatter={customFormatter}
      filterColumns={(columns) => {
        // Example: Filter out internal columns
        return columns.filter((col) => !col.startsWith("_") && col !== "id")
      }}
      onDataProcessed={(data) => {
        console.log("[v0] Processed data:", data.length, "tables")
      }}
    />
  )
}
