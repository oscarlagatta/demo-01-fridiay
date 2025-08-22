"use client"

import { useMemo, useCallback, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community"
import { MasterDetailModule } from "ag-grid-enterprise"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { useTransactionSearchContext } from "./transaction-search-provider"

interface TransactionRow {
  id: string
  source?: string
  sourceType?: string
  detailData?: any[]
  [key: string]: any
}

const DetailCellRenderer = (props: ICellRendererParams) => {
  const { data } = props

  if (!data?.detailData || data.detailData.length === 0) {
    return <div className="p-4 text-gray-500">No detail data available</div>
  }

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined || value === "" || value === "null") {
      return "—"
    }

    // Format dates
    if (columnName.includes("DATE") || columnName.includes("TS")) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + " " + date.toLocaleTimeString()
        }
      } catch (e) {
        // If date parsing fails, return original value
      }
    }

    // Format amounts
    if (columnName.includes("AMT") && !isNaN(Number.parseFloat(value))) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(Number.parseFloat(value))
    }

    return String(value)
  }

  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Get all unique columns from detail data
  const allColumns = new Set<string>()
  data.detailData.forEach((item: any) => {
    if (item._raw) {
      Object.keys(item._raw).forEach((key) => allColumns.add(key))
    }
  })
  const sortedColumns = Array.from(allColumns).sort()

  return (
    <div className="p-4 bg-gray-50 border-t">
      <h4 className="font-semibold text-gray-900 mb-3">Transaction Details for {data.sourceType}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {sortedColumns.slice(0, 8).map((column) => (
                <th
                  key={column}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {formatColumnName(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.detailData.map((item: any, index: number) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {sortedColumns.slice(0, 8).map((column) => (
                  <td key={column} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {formatCellValue(item._raw?.[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TransactionDetailsTableAgGrid() {
  const { results, selectedAitId, hideTable, id } = useTransactionSearchContext()
  const gridRef = useRef<AgGridReact>(null)

  // Helper functions
  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getSystemName = (aitId: string) => {
    if (!results) return `AIT ${aitId}`

    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  }

  const { rowData, columnDefs } = useMemo(() => {
    if (!results || !selectedAitId) return { rowData: [], columnDefs: [] }

    const relevantResults = results.filter((detail) => {
      return detail.aitNumber === selectedAitId
    })

    // Group results by sourceType
    const groupedBySourceType = relevantResults.reduce(
      (acc, detail) => {
        const sourceType = detail.sourceType || "Unknown Source Type"
        if (!acc[sourceType]) {
          acc[sourceType] = []
        }
        acc[sourceType].push(detail)
        return acc
      },
      {} as Record<string, typeof relevantResults>,
    )

    // Create master rows (one per Source Type)
    const rowData: TransactionRow[] = Object.entries(groupedBySourceType).map(([sourceType, details], index) => {
      const firstDetail = details[0]
      return {
        id: `master-${index}`,
        sourceType,
        source: firstDetail.source,
        recordCount: details.length,
        detailData: details, // Store detail data for the detail renderer
      }
    })

    const columnDefs: ColDef[] = [
      {
        headerName: "Source Type",
        field: "sourceType",
        pinned: "left",
        width: 250,
        cellRenderer: (params: any) => {
          const icon = params.node.expanded ? "📂" : "📁"
          return `${icon} ${params.value} (${params.data.recordCount} records)`
        },
        sortable: true,
        resizable: true,
      },
      {
        headerName: "Source",
        field: "source",
        pinned: "left",
        width: 200,
        sortable: true,
        resizable: true,
      },
      {
        headerName: "Record Count",
        field: "recordCount",
        width: 150,
        sortable: true,
        resizable: true,
        cellRenderer: (params: any) => `${params.value} transactions`,
      },
    ]

    return { rowData, columnDefs }
  }, [results, selectedAitId])

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns to fit content initially
    params.api.sizeColumnsToFit()
  }, [])

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
      minWidth: 100,
      suppressMenu: false,
      menuTabs: ["filterMenuTab", "generalMenuTab"],
    }),
    [],
  )

  return (
    <div className="h-full w-full bg-white">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={hideTable}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Flow Chart</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details (Master-Detail)</h1>
              <p className="text-sm text-gray-600">
                {getSystemName(selectedAitId || "")} • Transaction ID: {id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => gridRef.current?.api.expandAll()} variant="outline" size="sm" className="text-xs">
              Expand All
            </Button>
            <Button onClick={() => gridRef.current?.api.collapseAll()} variant="outline" size="sm" className="text-xs">
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* ag-Grid Container */}
      <div className="w-full h-[calc(100vh-200px)] p-6">
        <div className="ag-theme-alpine h-full w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            masterDetail={true}
            detailCellRenderer={DetailCellRenderer}
            detailRowHeight={400}
            detailRowAutoHeight={true}
            modules={[MasterDetailModule]}
            pagination={true}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            rowSelection="multiple"
            suppressRowClickSelection={false}
            animateRows={true}
            suppressRowHoverHighlight={false}
            enableRangeSelection={true}
            suppressMenuHide={false}
            getRowStyle={(params) => {
              return params.node.rowIndex! % 2 === 0
                ? { backgroundColor: "hsl(var(--background))" }
                : { backgroundColor: "hsl(var(--muted) / 0.3)" }
            }}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  )
}
