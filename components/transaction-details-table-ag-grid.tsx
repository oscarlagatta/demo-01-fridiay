"use client"

import { useMemo, useCallback, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { useTransactionSearchContext } from "./transaction-search-provider"

interface TransactionRow {
  id: string
  source?: string
  sourceType?: string
  [key: string]: any
}

export function TransactionDetailsTableAgGrid() {
  const { results, selectedAitId, hideTable, id } = useTransactionSearchContext()
  const gridRef = useRef<AgGridReact>(null)

  // Helper functions
  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined || value === "") {
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

  const getSystemName = (aitId: string) => {
    if (!results) return `AIT ${aitId}`

    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  }

  // Process data and create column definitions
  const { rowData, columnDefs } = useMemo(() => {
    if (!results || !selectedAitId) return { rowData: [], columnDefs: [] }

    const relevantResults = results.filter((detail) => {
      return detail.aitNumber === selectedAitId
    })

    const allColumns = new Set<string>()
    relevantResults.forEach((detail) => {
      if (detail._raw) {
        Object.keys(detail._raw).forEach((key) => allColumns.add(key))
      }
    })

    const sortedColumns = Array.from(allColumns).sort()

    // Create row data
    const rowData: TransactionRow[] = relevantResults.map((detail, index) => {
      const rawData = detail._raw || {}
      const row: TransactionRow = {
        id: `${rawData.WTX_GFD_ID || index}`,
        source: detail.source,
        sourceType: detail.sourceType || "Unknown",
      }

      sortedColumns.forEach((column) => {
        row[column] = (rawData as Record<string, any>)[column] || ""
      })

      return row
    })

    // Create column definitions
    const columnDefs: ColDef[] = []

    columnDefs.push({
      headerName: "Source Type",
      field: "sourceType",
      rowGroup: true,
      hide: true, // Hide the column since it's used for grouping
      enableRowGroup: true,
    })

    // First two data columns (pinned left)
    if (sortedColumns.length > 0) {
      columnDefs.push({
        headerName: formatColumnName(sortedColumns[0]),
        field: sortedColumns[0],
        pinned: "left",
        width: 180,
        cellRenderer: (params: any) => formatCellValue(params.value, sortedColumns[0]),
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
      })
    }

    if (sortedColumns.length > 1) {
      columnDefs.push({
        headerName: formatColumnName(sortedColumns[1]),
        field: sortedColumns[1],
        pinned: "left",
        width: 180,
        cellRenderer: (params: any) => formatCellValue(params.value, sortedColumns[1]),
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
      })
    }

    // Remaining columns (scrollable)
    sortedColumns.slice(2).forEach((column) => {
      columnDefs.push({
        headerName: formatColumnName(column),
        field: column,
        width: 160,
        cellRenderer: (params: any) => formatCellValue(params.value, column),
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
      })
    })

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
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details (ag-Grid)</h1>
              <p className="text-sm text-gray-600">
                {getSystemName(selectedAitId || "")} • Transaction ID: {id}
              </p>
            </div>
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
            groupDefaultExpanded={0} // Start with groups collapsed
            groupDisplayType="groupRows"
            groupIncludeFooter={false}
            groupIncludeTotalFooter={false}
            suppressAggFuncInHeader={true}
            groupUseEntireRow={false}
            groupRowRenderer="agGroupCellRenderer"
            // Auto group column configuration
            autoGroupColumnDef={{
              headerName: "Source Type Groups",
              field: "sourceType",
              cellRenderer: "agGroupCellRenderer",
              cellRendererParams: {
                suppressCount: false,
                checkbox: false,
                innerRenderer: (params: any) => {
                  if (params.node.group) {
                    return `${params.value} (${params.node.allChildrenCount} records)`
                  }
                  return params.value
                },
              },
              pinned: "left",
              width: 250,
              sortable: true,
              resizable: true,
            }}
            // Pagination
            pagination={true}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            // Selection
            rowSelection="multiple"
            suppressRowClickSelection={false}
            // Animation and interaction
            animateRows={true}
            suppressRowHoverHighlight={false}
            enableRangeSelection={true}
            suppressMenuHide={false}
            // Event handlers
            onGridReady={onGridReady}
            getRowStyle={(params) => {
              if (params.node.group) {
                return {
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  fontWeight: "600",
                  borderLeft: "4px solid hsl(var(--primary))",
                }
              }
              return params.node.rowIndex! % 2 === 0
                ? { backgroundColor: "hsl(var(--background))" }
                : { backgroundColor: "hsl(var(--muted) / 0.3)" }
            }}
          />
        </div>
      </div>
    </div>
  )
}
