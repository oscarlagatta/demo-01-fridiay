"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useTransactionSearchContext } from "@/components/transaction-search-provider"
import { useQueryClient } from "@tanstack/react-query"

const ID_REGEX = /^[A-Z0-9]{16}$/

interface SearchCriteria {
  transactionId: string
  transactionAmount: string
  dateStart: string
  dateEnd: string
}

function PaymentSearchBox() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transactionId: "",
    transactionAmount: "",
    dateStart: "",
    dateEnd: "",
  })

  const [activeMode, setActiveMode] = useState<"track" | "observability">("track")

  const queryClient = useQueryClient()
  const { searchByAll, clear: clearTx, isFetching: txFetching } = useTransactionSearchContext()

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasValidSearch && !isSearching) {
      handleSearch()
    }
  }

  const validId = useMemo(
    () => ID_REGEX.test((searchCriteria.transactionId || "").trim().toUpperCase()),
    [searchCriteria.transactionId],
  )

  const hasValidSearch = useMemo(() => {
    const hasId = validId
    const hasAmount = searchCriteria.transactionAmount.trim() !== ""
    const hasDateRange = searchCriteria.dateStart || searchCriteria.dateEnd
    return hasId || hasAmount || hasDateRange
  }, [validId, searchCriteria.transactionAmount, searchCriteria.dateStart, searchCriteria.dateEnd])

  const hasAnyValue = useMemo(() => Object.values(searchCriteria).some((v) => v.trim() !== ""), [searchCriteria])

  const handleSearch = async () => {
    if (!hasValidSearch) return

    searchByAll({
      transactionId: searchCriteria.transactionId.trim() || undefined,
      transactionAmount: searchCriteria.transactionAmount.trim() || undefined,
      dateStart: searchCriteria.dateStart || undefined,
      dateEnd: searchCriteria.dateEnd || undefined,
    })
  }

  const handleClear = async () => {
    // Reset local inputs
    setSearchCriteria({
      transactionId: "",
      transactionAmount: "",
      dateStart: "",
      dateEnd: "",
    })

    // Exit transaction search mode so nodes show Flow/Trend/Balanced again
    clearTx()

    // Force-refresh Splunk data so Flow/Trend/Balanced color statuses are up to date
    await queryClient.invalidateQueries({ queryKey: ["splunk-data"] })
    await queryClient.refetchQueries({ queryKey: ["splunk-data"] })
  }

  const isSearching = txFetching

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search for a transaction</span>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <Button
                variant={activeMode === "track" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-3 py-1 text-xs ${
                  activeMode === "track"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveMode("track")}
              >
                Track and Trace
              </Button>
              <Button
                variant={activeMode === "observability" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-3 py-1 text-xs border-l ${
                  activeMode === "observability"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveMode("observability")}
              >
                Observability
              </Button>
            </div>
          </CardTitle>
          <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end max-w-full">
            {/* Transaction ID with fixed helper height to avoid alignment shift */}
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <Input
                type="text"
                id="transaction-id"
                placeholder="Enter Transaction ID"
                value={searchCriteria.transactionId}
                onChange={(e) => handleInputChange("transactionId", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              <div className="h-4">
                {!validId && searchCriteria.transactionId ? (
                  <span className="text-[10px] text-muted-foreground">Enter a 16-character alphanumeric ID</span>
                ) : null}
              </div>
            </div>

            {/* Amount with spacer for consistent alignment */}
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="transaction-amount">Transaction Amount</Label>
              <Input
                type="text"
                id="transaction-amount"
                placeholder="Enter Amount"
                value={searchCriteria.transactionAmount}
                onChange={(e) => handleInputChange("transactionAmount", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              <div className="h-4">
                {searchCriteria.transactionAmount.trim() !== "" ? (
                  <span className="text-[10px] text-green-600">Amount search enabled</span>
                ) : null}
              </div>
            </div>

            {/* Date Start with spacer */}
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="date-start">Date Range (Start)</Label>
              <Input
                type="date"
                id="date-start"
                value={searchCriteria.dateStart}
                onChange={(e) => handleInputChange("dateStart", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              <div className="h-4" />
            </div>

            {/* Date End with spacer */}
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="date-end">Date Range (End)</Label>
              <Input
                type="date"
                id="date-end"
                value={searchCriteria.dateEnd}
                onChange={(e) => handleInputChange("dateEnd", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              <div className="h-4" />
            </div>

            {/* Buttons aligned with inputs, consistent gap */}
            <div className="flex items-end gap-2 flex-shrink-0">
              <Button
                onClick={handleSearch}
                disabled={!hasValidSearch || isSearching}
                className="flex items-center gap-2"
                size="default"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search Transaction"}
              </Button>

              {hasAnyValue && (
                <Button
                  onClick={handleClear}
                  variant="secondary"
                  disabled={isSearching}
                  className="flex items-center gap-2"
                  size="default"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSearchBox
