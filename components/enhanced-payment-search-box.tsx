"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Activity } from "lucide-react"
import { useMemo, useState } from "react"
import { useMultiContextSearch } from "@/components/multi-context-search-provider"
import { useQueryClient } from "@tanstack/react-query"

const ID_REGEX = /^[A-Z0-9]{16}$/

interface SearchCriteria {
  transactionId: string
  transactionAmount: string
  dateStart: string
  dateEnd: string
}

function EnhancedPaymentSearchBox() {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transactionId: "",
    transactionAmount: "",
    dateStart: "",
    dateEnd: "",
  })

  const queryClient = useQueryClient()

  const {
    searchByAll,
    clear: clearTx,
    isFetching: txFetching,
    currentFlowName,
    supportedCurrencies,
    matchedAitIds,
    hasResults,
  } = useMultiContextSearch()

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

    try {
      await searchByAll({
        transactionId: searchCriteria.transactionId.trim() || undefined,
        transactionAmount: searchCriteria.transactionAmount.trim() || undefined,
        dateStart: searchCriteria.dateStart || undefined,
        dateEnd: searchCriteria.dateEnd || undefined,
      })
    } catch (error) {
      console.error("[v0] Search failed:", error)
    }
  }

  const handleClear = async () => {
    setSearchCriteria({
      transactionId: "",
      transactionAmount: "",
      dateStart: "",
      dateEnd: "",
    })

    try {
      clearTx()
      await queryClient.invalidateQueries({ queryKey: ["splunk-data"] })
      await queryClient.refetchQueries({ queryKey: ["splunk-data"] })
    } catch (error) {
      console.error("[v0] Clear failed:", error)
    }
  }

  const isSearching = txFetching

  const currenciesArray = Array.isArray(supportedCurrencies) ? supportedCurrencies : []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Search for a transaction
            {hasResults && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {matchedAitIds.size} matches
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            You can search for a transaction by ID, Amount, or Date Range. Currently searching in:{" "}
            <strong>{currentFlowName || "Unknown Flow"}</strong>
            {currenciesArray.length > 0 && (
              <span className="text-xs text-muted-foreground block mt-1">
                Supported currencies: {currenciesArray.join(", ")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end max-w-full">
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

export default EnhancedPaymentSearchBox
