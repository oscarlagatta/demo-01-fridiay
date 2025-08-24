"use client"

import { useMemo, useCallback, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent, ICellRendererParams, RowClickedEvent } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import { useGetSplunkUsWiresTransactionDetailsByAmount } from "@/lib/generated/hooks"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useTransactionSearchContext } from "./transaction-search-provider"

interface TransactionRow {
  id: string
  transactionRef: string
  amount: string
  currency: string
  date: string
  source: string
  destination: string
  country: string
  status: string
  aitNumber: string
  aitName: string
  [key: string]: any
}

interface TransactionSearchResultsGridProps {
  transactionAmount: string
  dateStart?: string
  dateEnd?: string
  onBack: () => void
}

export function TransactionSearchResultsGrid({
  transactionAmount,
  dateStart,
  dateEnd,
  onBack,
}: TransactionSearchResultsGridProps) {
  const { search } = useTransactionSearchContext()
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null)

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useGetSplunkUsWiresTransactionDetailsByAmount(transactionAmount, dateStart, dateEnd)

  console.log("[v0] Amount search API response:", apiResponse)

  const formatCellValue = useCallback((value: any, columnName: string) => {
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
    if (columnName.includes("AMT") || columnName === "amount") {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(numValue)
      }
    }

    return String(value)
  }, [])

  const { rowData, totalTransactions } = useMemo(() => {
    if (!apiResponse || !Array.isArray(apiResponse)) {
      return { rowData: [], totalTransactions: 0 }
    }

    const transformedData: TransactionRow[] = apiResponse.map((transaction, index) => {
      const raw = transaction._raw
      return {
        id: raw.BCC_CPS_CORRELATION || raw.RUA_20BYTE_STRING_001 || `transaction-${index}`,
        transactionRef: raw.TBT_REF_NUM || "—",
        amount: raw.TBT_BILLING_AMT || raw.TPP_TRAN_AMT || "0",
        currency: raw.AQQ_BILLING_CURR_CODE || raw.TPP_CURR_CODE || "USD",
        date: raw.RQO_TRAN_DATE || "—",
        source: raw.SMH_SOURCE || "—",
        destination: raw.SMH_DEST || "—",
        country: raw.XQQ_CUST_CNTRY_CODE || raw.TPP_CNTRY_CODE || "—",
        status: raw.RRR_ACTION_CODE === "A" ? "Approved" : raw.RRR_ACTION_CODE === "R" ? "Rejected" : "Pending",
        aitNumber: transaction.aitNumber || "—",
        aitName: transaction.aitName || "—",
        // Include all raw data for detailed view
        ...raw,
      }
    })

    return { rowData: transformedData, totalTransactions: transformedData.length }
  }, [apiResponse])

  const columnDefs = useMemo(
    (): ColDef[] => [
      {
        headerName: "Transaction Ref",
        field: "transactionRef",
        sortable: true,
        filter: true,
        width: 180,
        pinned: "left",
      },
      {
        headerName: "Amount",
        field: "amount",
        sortable: true,
        filter: "agNumberColumnFilter",
        width: 120,
        cellRenderer: (params: ICellRendererParams) => formatCellValue(params.value, "amount"),
      },
      {
        headerName: "Currency",
        field: "currency",
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        headerName: "Date",
        field: "date",
        sortable: true,
        filter: "agDateColumnFilter",
        width: 150,
        cellRenderer: (params: ICellRendererParams) => formatCellValue(params.value, "DATE"),
      },
      {
        headerName: "Source",
        field: "source",
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        headerName: "Destination",
        field: "destination",
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: "Country",
        field: "country",
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        headerName: "Status",
        field: "status",
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: (params: ICellRendererParams) => {
          const status = params.value
          const colorClass =
            status === "Approved"
              ? "bg-green-100 text-green-800"
              : status === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"

          return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colorClass}">${status}</span>`
        },
      },
      {
        headerName: "AIT System",
        field: "aitName",
        sortable: true,
        filter: true,
        width: 150,
      },
    ],
    [formatCellValue],
  )

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
      flex: 1,
    }),
    [],
  )

  const onRowClicked = useCallback(
    (event: RowClickedEvent) => {
      const transactionId = event.data.id
      console.log("[v0] Transaction selected:", transactionId)

      // Use the existing search functionality to load transaction details
      search(transactionId)
    },
    [search],
  )

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg">Searching transactions by amount...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2">Error loading transaction data</p>
          <p className="text-gray-600 mb-4">{error?.message || "Failed to fetch transactions"}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
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
            <Button onClick={onBack} variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Transaction Search Results</h1>
              <p className="text-sm text-gray-600">
                Amount: ${transactionAmount} • {totalTransactions} transactions found
                {dateStart && ` • From: ${dateStart}`}
                {dateEnd && ` • To: ${dateEnd}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div className="h-[calc(100%-80px)] w-full p-6">
        <div className="h-full w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="ag-theme-quartz h-full w-full">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              animateRows={true}
              suppressRowHoverHighlight={false}
              rowSelection="single"
              onRowClicked={onRowClicked}
              suppressHorizontalScroll={false}
              alwaysShowHorizontalScroll={true}
              suppressColumnVirtualisation={false}
              getRowStyle={(params) => {
                return params.node.rowIndex! % 2 === 0
                  ? { backgroundColor: "#ffffff", cursor: "pointer" }
                  : { backgroundColor: "#f8fafc", cursor: "pointer" }
              }}
              onGridReady={(params: GridReadyEvent) => {
                setTimeout(() => {
                  if (params.api) {
                    params.api.sizeColumnsToFit()
                  }
                }, 100)
              }}
            />
          </div>
        </div>
      </div>

      {totalTransactions === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria or amount</p>
          </div>
        </div>
      )}
    </div>
  )
}
