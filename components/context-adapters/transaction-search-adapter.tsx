import { useTransactionSearchContext } from "@/components/transaction-search-provider"
import type { ContextAdapter } from "@/types/ag-grid-hoc"

export const transactionSearchAdapter: ContextAdapter = {
  useContext: useTransactionSearchContext,
  extractData: (contextData) => ({
    results: contextData.results,
    selectedAitId: contextData.selectedAitId,
    id: contextData.id,
    isTableLoading: contextData.isTableLoading,
    hideTable: contextData.hideTable,
  }),
  getSystemName: (aitId: string, results: any[]) => {
    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  },
}
