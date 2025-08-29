"use client"

import { useMemo, useCallback, useState } from "react"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import type { TransactionTableAdapter } from "@/types/transaction-table-types"

interface TransactionRow {
  id: string
  [key: string]: any
}

interface TransactionDetailsTableAgGridFlexibleProps {
  adapter: TransactionTableAdapter
  className?: string
}

export function TransactionDetailsTableAgGridFlexible({
  adapter,
  className = "",
}: TransactionDetailsTableAgGridFlexibleProps) {
  const { results, selectedAitId, hideTable, id, isTableLoading } = adapter.getData()
  const config = adapter.getConfig()
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      width: 180,
      minWidth: 120,
      maxWidth: 350,
      autoHeaderHeight: true,
      wrapHeaderText: true,
      suppressSizeToFit: false,
    }),
    [],
  )

  const gridOptions = useMemo(
    () => ({
      suppressHorizontalScroll: false,
      alwaysShowHorizontalScroll: true,
      suppressColumnVirtualisation: false,
      enableRangeSelection: true,
      rowSelection: "multiple" as const,
      animateRows: false,
      suppressRowHoverHighlight: false,
      rowBuffer: 10,
    }),
    [],
  )

  // Only log essential debugging information
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[v0] AG Grid Debug - Record counts:",
      results?.map((r) => ({ sourceType: r.sourceType, aitNumber: r.aitNumber })),
    )
  }

  console.log("[v0] AG Grid Debug - Selected AIT ID:", selectedAitId)
  console.log("[v0] AG Grid Debug - Transaction ID:", id)

  const { sourceTypeTables, allColumns } = useMemo(() => {
    if (!results || !selectedAitId) return { sourceTypeTables: [], allColumns: [] }

    if (process.env.NODE_ENV === "development") {
      console.log("[v0] Processing results for AIT ID:", selectedAitId, "Total results:", results.length)
    }

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
        const rawData = detail._raw as Record<string, any>
        Object.keys(rawData).forEach((key) => allColumnsSet.add(key))
      }
    })
    const allColumns = Array.from(allColumnsSet).sort()

    // Create separate table data for each Source Type
    const sourceTypeTables = Object.entries(groupedBySourceType).map(([sourceType, details]) => {
      const rowData: TransactionRow[] = details.map((detail, index) => {
        const row: TransactionRow = {
          id: `${sourceType}-${index}`,
        }

        if (detail._raw) {
          const rawData = detail._raw as Record<string, any>
          Object.keys(rawData).forEach((column) => {
            const value = rawData[column]
            row[column] = value !== null && value !== undefined ? value : ""
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

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[v0] Created tables:",
        sourceTypeTables.map((t) => ({ sourceType: t.sourceType, recordCount: t.recordCount })),
      )
    }

    return { sourceTypeTables, allColumns }
  }, [results, selectedAitId])

  const createColumnDefs = useCallback(
    (columns: string[]): ColDef[] => {
      const columnDefs: ColDef[] = []

      columns.forEach((column) => {
        columnDefs.push({
          headerName: config.formatColumnName!(column),
          field: column,
          sortable: true,
          resizable: true,
          autoHeaderHeight: true,
          width: 180,
          minWidth: 120,
          maxWidth: 350,
          cellRenderer: (params: ICellRendererParams) => {
            return config.formatCellValue!(params.value, column)
          },
        })
      })

      return columnDefs
    },
    [config],
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

  const getSystemName = (aitId: string) => {
    return config.getSystemName!(aitId, results || [])
  }

  if (isTableLoading) {
    return (
      <div className={`w-full ${className}`}>
        {/* ... existing loading skeleton ... */}
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
                <span>Back</span>
              </Button>
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Skeleton for expandable table sections */}
          {[1, 2].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Table Header Skeleton */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* AG Grid Table Skeleton */}
              <div className="w-full p-4">
                <div className="space-y-3">
                  {/* Header row skeleton */}
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                      <Skeleton key={col} className="h-10 flex-1 min-w-[120px]" />
                    ))}
                  </div>

                  {/* Data rows skeleton */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                    <div key={row} className="flex space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                        <Skeleton key={col} className="h-8 flex-1 min-w-[120px]" />
                      ))}
                    </div>
                  ))}

                  {/* Pagination skeleton */}
                  <div className="flex items-center justify-between pt-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Early return with helpful message if no data
  if (!results || !selectedAitId || sourceTypeTables.length === 0) {
    return (
      <div className={`w-full ${className}`}>
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
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
                <p className="text-sm text-gray-600">No transaction data available</p>
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
    <div className={`w-full ${className}`}>
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
              <span>Back</span>
            </Button>
            <div>
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
                <div className="w-full">
                  <div className="ag-theme-quartz" style={{ height: "500px", width: "100%" }}>
                    <AgGridReact
                      rowData={table.rowData}
                      columnDefs={createColumnDefs(allColumns)}
                      defaultColDef={defaultColDef}
                      gridOptions={gridOptions}
                      pagination={true}
                      paginationPageSize={25}
                      paginationPageSizeSelector={[10, 25, 50, 100]}
                      animateRows={false}
                      suppressRowHoverHighlight={false}
                      suppressHorizontalScroll={false}
                      alwaysShowHorizontalScroll={true}
                      suppressColumnVirtualisation={false}
                      skipHeaderOnAutoSize={false}
                      getRowStyle={(params) => {
                        return params.node.rowIndex! % 2 === 0
                          ? { backgroundColor: "#ffffff" }
                          : { backgroundColor: "#f8fafc" }
                      }}
                      onGridReady={(params: GridReadyEvent) => {
                        try {
                          // Use longer timeout for large datasets and only size columns to fit
                          setTimeout(() => {
                            if (params.api) {
                              params.api.sizeColumnsToFit()
                            }
                          }, 200)
                        } catch (error) {
                          console.error("[v0] Error in grid ready:", error)
                        }
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
  )
}
