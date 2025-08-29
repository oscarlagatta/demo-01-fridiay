import { TransactionDetailsTableAgGridFlexible } from "@/components/transaction-details-table-ag-grid-flexible"
import {
  UsWiresTransactionTableAdapter,
  IndiaTransactionTableAdapter,
  useTransactionSearchContext,
  useUsWiresTransactionContext,
  useIndiaTransactionContext,
} from "@/adapters/transaction-table-adapters"

// Example 1: Using with US Wires context
export function UsWiresTableExample() {
  const usWiresContext = useTransactionSearchContext() // or useUsWiresTransactionContext()
  const adapter = new UsWiresTransactionTableAdapter(usWiresContext)

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} />
}

// Example 2: Using with India context
export function IndiaTableExample() {
  const indiaContext = useIndiaTransactionContext()
  const adapter = new IndiaTransactionTableAdapter(indiaContext)

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} />
}

// Example 3: Dynamic context switching
export function DynamicTableExample({ region }: { region: "us-wires" | "india" }) {
  const usWiresContext = useUsWiresTransactionContext()
  const indiaContext = useIndiaTransactionContext()

  const adapter =
    region === "us-wires"
      ? new UsWiresTransactionTableAdapter(usWiresContext)
      : new IndiaTransactionTableAdapter(indiaContext)

  return <TransactionDetailsTableAgGridFlexible adapter={adapter} />
}
