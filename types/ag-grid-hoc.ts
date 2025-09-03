import type { ColDef, GridOptions, ICellRendererParams } from "ag-grid-community"

export interface TransactionRow {
  id: string
  [key: string]: any
}

export interface SourceTypeTable {
  sourceType: string
  recordCount: number
  rowData: TransactionRow[]
}

export interface AGGridConfig {
  defaultColDef?: Partial<ColDef>
  gridOptions?: Partial<GridOptions>
  pagination?: {
    enabled: boolean
    pageSize: number
    pageSizeOptions: number[]
  }
  styling?: {
    height: string
    theme: string
    alternateRowColors: boolean
  }
}

export interface DataFormatter {
  formatColumnName?: (columnName: string) => string
  formatCellValue?: (value: any, columnName: string, rowData?: any) => string
  createColumnDefs?: (columns: string[], formatter: DataFormatter) => ColDef[]
}

export interface ContextAdapter<T = any> {
  useContext: () => T
  extractData: (contextData: T) => {
    results: any[]
    selectedAitId: string | null
    id: string | null
    isTableLoading: boolean
    hideTable: () => void
  }
  getSystemName?: (aitId: string, results: any[]) => string
}

export interface AGGridHOCProps {
  config?: AGGridConfig
  formatter?: DataFormatter
  contextAdapter: ContextAdapter
  customRenderers?: Record<string, (params: ICellRendererParams) => any>
  onDataProcessed?: (data: SourceTypeTable[]) => void
  filterColumns?: (columns: string[]) => string[]
  groupByField?: string
  emptyStateConfig?: {
    title: string
    subtitle: string
  }
}
