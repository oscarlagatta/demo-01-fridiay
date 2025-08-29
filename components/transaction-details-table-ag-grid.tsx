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
  contextData?: any // Optional context data prop
  contextType?: ContextType // Optional context type for adapter selection
  adapter?: TransactionTableAdapter // Optional custom adapter
  className?: string
}

export function TransactionDetailsTableAgGrid({
  contextData,
  contextType = "us-wires",
  adapter: customAdapter,
  className,
}: TransactionDetailsTableAgGridProps = {}) {
  const hookContextData = useTransactionSearchContext()
  const effectiveContextData = contextData || hookContextData

  const adapter = customAdapter || createAdapterForContextType(effectiveContextData, contextType)

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} className={className} />
}

function createAdapterForContextType(contextData: any, contextType: ContextType): TransactionTableAdapter {
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
