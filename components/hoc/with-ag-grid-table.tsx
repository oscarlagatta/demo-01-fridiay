"use client"

import type React from "react"
import { useMemo, useCallback, useState } from "react"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import type { AGGridHOCProps, SourceTypeTable, TransactionRow, DataFormatter, AGGridConfig } from "@/types/ag-grid-hoc"

// Default configurations
const defaultAGGridConfig: AGGridConfig = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    width: 180,
    minWidth: 120,
    maxWidth: 350,
    autoHeaderHeight: true,
    wrapHeaderText: true,
    suppressSizeToFit: false,
  },
  gridOptions: {
    suppressHorizontalScroll: false,
    alwaysShowHorizontalScroll: true,
    suppressColumnVirtualisation: false,
    enableRangeSelection: true,
    rowSelection: "multiple",
    animateRows: false,
    suppressRowHoverHighlight: false,
    rowBuffer: 10,
  },
  pagination: {
    enabled: true,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  styling: {
    height: "500px",
    theme: "ag-theme-quartz",
    alternateRowColors: true,
  },
}

const defaultFormatter: DataFormatter = {
  formatColumnName: (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  },
  formatCellValue: (value: any, columnName: string) => {
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
  },
}

export function withAGGridTable<P extends object>(WrappedComponent?: React.ComponentType<P>) {
  return function AGGridTableHOC(props: AGGridHOCProps & P) {
    const {
      config = {},
      formatter = {},
      contextAdapter,
      customRenderers = {},
      onDataProcessed,
      filterColumns,
      groupByField = "sourceType",
      emptyStateConfig = {
        title: "No transaction data found",
        subtitle: "Please perform a search to view transaction details",
      },
      ...restProps
    } = props

    // Merge configurations with defaults
    const mergedConfig = useMemo(
      () => ({
        ...defaultAGGridConfig,
        ...config,
        defaultColDef: { ...defaultAGGridConfig.defaultColDef, ...config.defaultColDef },
        gridOptions: { ...defaultAGGridConfig.gridOptions, ...config.gridOptions },
        pagination: { ...defaultAGGridConfig.pagination, ...config.pagination },
        styling: { ...defaultAGGridConfig.styling, ...config.styling },
      }),
      [config],
    )

    const mergedFormatter = useMemo(
      () => ({
        ...defaultFormatter,
        ...formatter,
      }),
      [formatter],
    )

    // Use the provided context adapter
    const contextData = contextAdapter.useContext()
    const { results, selectedAitId, id, isTableLoading, hideTable } = contextAdapter.extractData(contextData)

    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())

    // Process data into source type tables
    const { sourceTypeTables, allColumns } = useMemo(() => {
      if (!results || !selectedAitId) return { sourceTypeTables: [], allColumns: [] }

      const relevantResults = results.filter((detail) => detail.aitNumber === selectedAitId)

      // Group results by the specified field (default: sourceType)
      const groupedResults = relevantResults.reduce(
        (acc, detail) => {
          const groupKey = detail[groupByField] || `Unknown ${groupByField}`
          if (!acc[groupKey]) {
            acc[groupKey] = []
          }
          acc[groupKey].push(detail)
          return acc
        },
        {} as Record<string, typeof relevantResults>,
      )

      // Get all unique columns
      const allColumnsSet = new Set<string>()
      relevantResults.forEach((detail) => {
        if (detail._raw) {
          const rawData = detail._raw as Record<string, any>
          Object.keys(rawData).forEach((key) => allColumnsSet.add(key))
        }
      })

      let allColumns = Array.from(allColumnsSet).sort()

      // Apply column filtering if provided
      if (filterColumns) {
        allColumns = filterColumns(allColumns)
      }

      // Create table data for each group
      const sourceTypeTables: SourceTypeTable[] = Object.entries(groupedResults).map(([groupKey, details]) => {
        const rowData: TransactionRow[] = details.map((detail, index) => {
          const row: TransactionRow = { id: `${groupKey}-${index}` }

          if (detail._raw) {
            const rawData = detail._raw as Record<string, any>
            allColumns.forEach((column) => {
              const value = rawData[column]
              row[column] = value !== null && value !== undefined ? value : ""
            })
          }

          return row
        })

        return {
          sourceType: groupKey,
          recordCount: details.length,
          rowData,
        }
      })

      // Call onDataProcessed callback if provided
      if (onDataProcessed) {
        onDataProcessed(sourceTypeTables)
      }

      return { sourceTypeTables, allColumns }
    }, [results, selectedAitId, groupByField, filterColumns, onDataProcessed])

    // Create column definitions with custom renderers
    const createColumnDefs = useCallback(
      (columns: string[]): ColDef[] => {
        return columns.map((column) => ({
          headerName: mergedFormatter.formatColumnName!(column),
          field: column,
          sortable: true,
          resizable: true,
          autoHeaderHeight: true,
          width: 180,
          minWidth: 120,
          maxWidth: 350,
          cellRenderer:
            customRenderers[column] ||
            ((params: ICellRendererParams) => {
              return mergedFormatter.formatCellValue!(params.value, column, params.data)
            }),
        }))
      },
      [mergedFormatter, customRenderers],
    )

    // Table expansion controls
    const toggleTable = useCallback((sourceType: string) => {
      setExpandedTables((prev) => {
        const newExpanded = new Set(prev)
        if (newExpanded.has(sourceType)) {
          newExpanded.delete(sourceType)
        } else {
          newExpanded.add(sourceType)
        }
        return newExpanded
      })
    }, [])

    const expandAllTables = useCallback(() => {
      setExpandedTables(new Set(sourceTypeTables.map((table) => table.sourceType)))
    }, [sourceTypeTables])

    const collapseAllTables = useCallback(() => {
      setExpandedTables(new Set())
    }, [])

    // Get system name using adapter or default logic
    const getSystemName = useCallback(
      (aitId: string) => {
        if (contextAdapter.getSystemName) {
          return contextAdapter.getSystemName(aitId, results || [])
        }
        return `AIT ${aitId}`
      },
      [contextAdapter, results],
    )

    // Loading state
    if (isTableLoading) {
      return <LoadingSkeleton hideTable={hideTable} />
    }

    // Empty state
    if (!results || !selectedAitId || sourceTypeTables.length === 0) {
      return <EmptyState hideTable={hideTable} config={emptyStateConfig} />
    }

    // Main render
    return (
      <div className="w-full">
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
                  {getSystemName(selectedAitId)} • Transaction ID: {id} • {sourceTypeTables.length} Source Types
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

        {/* Tables */}
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

                {/* AG Grid Table */}
                {isExpanded && (
                  <div className="w-full">
                    <div
                      className={mergedConfig.styling.theme}
                      style={{ height: mergedConfig.styling.height, width: "100%" }}
                    >
                      <AgGridReact
                        rowData={table.rowData}
                        columnDefs={createColumnDefs(allColumns)}
                        defaultColDef={mergedConfig.defaultColDef}
                        gridOptions={mergedConfig.gridOptions}
                        pagination={mergedConfig.pagination.enabled}
                        paginationPageSize={mergedConfig.pagination.pageSize}
                        paginationPageSizeSelector={mergedConfig.pagination.pageSizeOptions}
                        getRowStyle={
                          mergedConfig.styling.alternateRowColors
                            ? (params) => {
                                return params.node.rowIndex! % 2 === 0
                                  ? { backgroundColor: "#ffffff" }
                                  : { backgroundColor: "#f8fafc" }
                              }
                            : undefined
                        }
                        onGridReady={(params: GridReadyEvent) => {
                          setTimeout(() => {
                            if (params.api) {
                              params.api.sizeColumnsToFit()
                            }
                          }, 200)
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Render wrapped component if provided */}
        {WrappedComponent && <WrappedComponent {...(restProps as P)} />}
      </div>
    )
  }
}

function LoadingSkeleton({ hideTable }: { hideTable: () => void }) {
  return (
    <div className="w-full">
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
        {[1, 2].map((index) => (
          <div key={index} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="w-full p-4">
              <div className="space-y-3">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                    <Skeleton key={col} className="h-10 flex-1 min-w-[120px]" />
                  ))}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <div key={row} className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                      <Skeleton key={col} className="h-8 flex-1 min-w-[120px]" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({
  hideTable,
  config,
}: {
  hideTable: () => void
  config: { title: string; subtitle: string }
}) {
  return (
    <div className="w-full">
      <div className="border-b bg-white px-6 py-4">
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
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-lg">{config.title}</p>
          <p className="text-gray-400 text-sm mt-2">{config.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export const AGGridTable = withAGGridTable()
