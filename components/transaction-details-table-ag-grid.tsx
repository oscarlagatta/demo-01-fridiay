"use client"

import { useMemo, useCallback, useState } from "react"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import { useTransactionSearchContext } from "./transaction-search-provider"

interface TransactionRow {
  id: string
  aitNumber?: string
  aitName?: string
  [key: string]: any
}

export function TransactionDetailsTableAgGrid() {
  const { results, selectedAitId, hideTable, id } = useTransactionSearchContext()
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  // Helper functions
  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
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

  const getSystemName = (aitId: string) => {
    if (!results) return `AIT ${aitId}`

    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  }

  const { sourceTypeTables, allColumns } = useMemo(() => {
    if (!results || !selectedAitId) return { sourceTypeTables: [], allColumns: [] }

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

    // Get all unique columns from all results
    const allColumnsSet = new Set<string>()
    relevantResults.forEach((detail) => {
      if (detail._raw) {
        Object.keys(detail._raw).forEach((key) => allColumnsSet.add(key))
      }
    })
    const allColumns = Array.from(allColumnsSet).sort()

    // Create separate table data for each Source Type
    const sourceTypeTables = Object.entries(groupedBySourceType).map(([sourceType, details]) => {
      const rowData: TransactionRow[] = details.map((detail, index) => {
        const row: TransactionRow = {
          id: `${sourceType}-${index}`,
          aitNumber: detail.aitNumber,
          aitName: detail.aitName,
        }

        // Add all columns from _raw data
        if (detail._raw) {
          Object.keys(detail._raw).forEach((column) => {
            row[column] = detail._raw[column] || ""
          })
        }

        return row
      })

      return {
        sourceType,
        recordCount: details.length,
        rowData,
      }
    })

    return { sourceTypeTables, allColumns }
  }, [results, selectedAitId])

  const createColumnDefs = useCallback((columns: string[]): ColDef[] => {
    const columnDefs: ColDef[] = [
      {
        headerName: "AIT Number",
        field: "aitNumber",
        pinned: "left",
        width: 150,
        sortable: true,
        resizable: true,
        cellRenderer: (params: ICellRendererParams) => params.value || "—",
      },
      {
        headerName: "AIT Name",
        field: "aitName",
        pinned: "left",
        width: 150,
        sortable: true,
        resizable: true,
        cellRenderer: (params: ICellRendererParams) => params.value || "—",
      },
    ]

    // Add dynamic columns from transaction data
    columns.forEach((column) => {
      columnDefs.push({
        headerName: formatColumnName(column),
        field: column,
        width: 150,
        sortable: true,
        resizable: true,
        filter: true,
        cellRenderer: (params: ICellRendererParams) => {
          const formattedValue = formatCellValue(params.value, column)
          return formattedValue
        },
      })
    })

    return columnDefs
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

  const toggleTable = (sourceType: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(sourceType)) {
      newExpanded.delete(sourceType)
    } else {
      newExpanded.add(sourceType)
    }
    setExpandedTables(newExpanded)
  }

  const expandAllTables = () => {
    setExpandedTables(new Set(sourceTypeTables.map((table) => table.sourceType)))
  }

  const collapseAllTables = () => {
    setExpandedTables(new Set())
  }

  // Early return with helpful message if no data
  if (!results || !selectedAitId || sourceTypeTables.length === 0) {
    return (
      <div className="h-full w-full bg-white">
        <div className="border-b bg-white px-6 py-4">
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
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
              <p className="text-sm text-gray-600">No transaction data available</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No transaction data found</p>
            <p className="text-gray-400 text-sm mt-2">Please perform a search to view transaction details</p>
          </div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details by Source Type</h1>
              <p className="text-sm text-gray-600">
                {getSystemName(selectedAitId || "")} • Transaction ID: {id} • {sourceTypeTables.length} Source Types
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={expandAllTables} variant="outline" size="sm" className="text-xs bg-transparent">
              Expand All
            </Button>
            <Button onClick={collapseAllTables} variant="outline" size="sm" className="text-xs bg-transparent">
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full h-[calc(100vh-200px)] p-6 overflow-y-auto">
        <div className="space-y-6">
          {sourceTypeTables.map((table) => {
            const isExpanded = expandedTables.has(table.sourceType)
            return (
              <div key={table.sourceType} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div
                  className="bg-gray-50 px-4 py-3 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleTable(table.sourceType)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{table.sourceType}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {table.recordCount} records
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual AG Grid Table */}
                {isExpanded && (
                  <div className="h-96">
                    <div className="ag-theme-quartz h-full w-full">
                      <AgGridReact
                        rowData={table.rowData}
                        columnDefs={createColumnDefs(allColumns)}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[5, 10, 25, 50]}
                        rowSelection="multiple"
                        suppressRowClickSelection={false}
                        animateRows={true}
                        suppressRowHoverHighlight={false}
                        enableRangeSelection={true}
                        suppressMenuHide={false}
                        getRowStyle={(params) => {
                          return params.node.rowIndex! % 2 === 0
                            ? { backgroundColor: "#ffffff" }
                            : { backgroundColor: "#f8fafc" }
                        }}
                        onGridReady={(params: GridReadyEvent) => {
                          params.api.sizeColumnsToFit()
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
