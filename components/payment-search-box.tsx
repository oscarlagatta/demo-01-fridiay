"use client"

import type React from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useTransactionSearchContext } from "@/components/transaction-search-provider"
import { useQueryClient } from "@tanstack/react-query"

const ID_REGEX = /^[A-Z0-9]{16}$/

interface SearchCriteria {
  transactionType: string
  transactionId: string
  transactionAmount: string
  dateStart: string
  dateEnd: string
}

function getDefaultDateRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  // Format as YYYY-MM-DD for input[type="date"]
  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  return {
    dateStart: formatDate(startDate),
    dateEnd: formatDate(endDate),
  }
}

function PaymentSearchBox() {
  const defaultDates = getDefaultDateRange()

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transactionType: "",
    transactionId: "",
    transactionAmount: "",
    dateStart: defaultDates.dateStart,
    dateEnd: defaultDates.dateEnd,
  })

  const [isDefaultDates, setIsDefaultDates] = useState(true)

  const queryClient = useQueryClient()
  const { searchByAll, clear: clearTx, isFetching: txFetching } = useTransactionSearchContext()

  useEffect(() => {
    setSearchCriteria((prev) => ({
      ...prev,
      dateStart: defaultDates.dateStart,
      dateEnd: defaultDates.dateEnd,
    }))
  }, [])

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (field === "dateStart" || field === "dateEnd") {
      const currentIsDefault =
        searchCriteria.dateStart === defaultDates.dateStart && searchCriteria.dateEnd === defaultDates.dateEnd
      setIsDefaultDates(currentIsDefault)
    }
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
    const hasType = searchCriteria.transactionType !== ""
    return hasId || hasAmount || hasDateRange || hasType
  }, [
    validId,
    searchCriteria.transactionAmount,
    searchCriteria.dateStart,
    searchCriteria.dateEnd,
    searchCriteria.transactionType,
  ])

  const hasAnyValue = useMemo(() => Object.values(searchCriteria).some((v) => v.trim() !== ""), [searchCriteria])

  const handleSearch = async () => {
    if (!hasValidSearch) return

    searchByAll({
      transactionType: searchCriteria.transactionType || undefined,
      transactionId: searchCriteria.transactionId.trim() || undefined,
      transactionAmount: searchCriteria.transactionAmount.trim() || undefined,
      dateStart: searchCriteria.dateStart || undefined,
      dateEnd: searchCriteria.dateEnd || undefined,
    })
  }

  const handleClear = async () => {
    setSearchCriteria({
      transactionType: "",
      transactionId: "",
      transactionAmount: "",
      dateStart: defaultDates.dateStart,
      dateEnd: defaultDates.dateEnd,
    })
    setIsDefaultDates(true)

    clearTx()

    await queryClient.invalidateQueries({ queryKey: ["splunk-data"] })
    await queryClient.refetchQueries({ queryKey: ["splunk-data"] })
  }

  const isSearching = txFetching

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for a transaction</CardTitle>
          <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end max-w-full">
            <div className="grid items-center gap-1.5 w-56 md:w-64 lg:w-72 shrink-0">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={searchCriteria.transactionType}
                onValueChange={(value) => handleInputChange("transactionType", value)}
                disabled={isSearching}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message-payment">Message Payment</SelectItem>
                  <SelectItem value="FilepaymentINRINR">File payment INR-INR</SelectItem>
                  <SelectItem value="FilePaymentUSDINR">File Payment USD-INR</SelectItem>
                  <SelectItem value="FilePaymentNONUSDINRWIP">File Payment NNUSD-INR [WIP]</SelectItem>
                  <SelectItem value="UPIOutbound">UPI Outbound</SelectItem>
                  <SelectItem value="UPIInbound">UPI Inbound</SelectItem>
                  <SelectItem value="NEFTRTGSIMPSINBOUND">NEFT / RTGS / IMPS INBOUND</SelectItem>
                </SelectContent>
              </Select>
              <div className="h-4">
                {searchCriteria.transactionType ? (
                  <span className="text-[10px] text-green-600">Type filter applied</span>
                ) : null}
              </div>
            </div>

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

            <div
              className={`rounded-lg p-3 flex-grow transition-colors ${
                isDefaultDates ? "bg-blue-50 dark:bg-blue-950/30" : "bg-transparent"
              }`}
            >
              <div className="flex flex-wrap gap-4 items-end">
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
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-blue-600 dark:text-blue-400">Last 7 days (default)</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2 flex-shrink-0 mt-4">
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
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSearchBox
