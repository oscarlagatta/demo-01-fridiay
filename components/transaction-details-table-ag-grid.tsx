"use client"

import { useTransactionSearchContext } from "./transaction-search-provider"
import { TransactionDetailsTableAgGridFlexible } from "./transaction-details-table-ag-grid-flexible"
import { UsWiresTransactionTableAdapter } from "@/adapters/transaction-table-adapters"

export function TransactionDetailsTableAgGrid() {
  const contextData = useTransactionSearchContext()
  const adapter = new UsWiresTransactionTableAdapter(contextData)

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} />
}
