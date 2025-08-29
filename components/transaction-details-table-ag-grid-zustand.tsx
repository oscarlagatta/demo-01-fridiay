"use client"

import { TransactionDetailsTableAgGridFlexible } from "./transaction-details-table-ag-grid-flexible"
import { useUsWiresStore, useIndiaStore } from "@/stores/zustand-transaction-store"
import { useMemo } from "react"

interface ZustandTableAdapter {
  getTableData: () => any[]
  isLoading: () => boolean
  getColumnConfig: () => any[]
  formatCurrency: (value: number) => string
  onRowClick?: (data: any) => void
}

// Zustand-based AG Grid component
export function TransactionDetailsTableAgGridZustand({
  region = "us-wires",
}: {
  region?: "us-wires" | "india"
}) {
  // Select appropriate store based on region
  const store = region === "us-wires" ? useUsWiresStore : useIndiaStore

  const { results, isLoading, showTable, setSelectedAitId } = store()

  // Create adapter for the flexible component
  const adapter = useMemo(
    (): ZustandTableAdapter => ({
      getTableData: () => results,
      isLoading: () => isLoading,
      getColumnConfig: () => (region === "us-wires" ? getUsWiresColumns() : getIndiaColumns()),
      formatCurrency: (value: number) =>
        region === "us-wires"
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
          : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value),
      onRowClick: (data) => setSelectedAitId(data.id),
    }),
    [results, isLoading, region, setSelectedAitId],
  )

  if (!showTable) return null

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} />
}

function getUsWiresColumns() {
  return [
    { field: "aitNumber", headerName: "AIT Number", sortable: true },
    { field: "aitName", headerName: "AIT Name", sortable: true },
    { field: "source", headerName: "Source", sortable: true },
  ]
}

function getIndiaColumns() {
  return [
    { field: "systemId", headerName: "System ID", sortable: true },
    { field: "systemName", headerName: "System Name", sortable: true },
    { field: "source", headerName: "Source", sortable: true },
  ]
}
