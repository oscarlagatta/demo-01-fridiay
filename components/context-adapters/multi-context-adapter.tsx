import { useMultiContextSearch } from "@/components/multi-context-search-provider"
import type { ContextAdapter } from "@/types/ag-grid-hoc"

export const multiContextAdapter: ContextAdapter = {
  useContext: useMultiContextSearch,
  extractData: (contextData) => ({
    results: contextData.results || [],
    selectedAitId: contextData.selectedAitId || null,
    id: contextData.id || null,
    isTableLoading: contextData.isFetching || false,
    hideTable: contextData.hideTable || (() => {}),
  }),
  getSystemName: (aitId: string, results: any[]) => {
    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  },
}
