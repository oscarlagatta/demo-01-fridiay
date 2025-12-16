"use client"

import type React from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  startdate: string
  enddate: string
}

function getDefaultDateRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const formatDateWithTime = (date: Date, isEndDate = false): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const time = isEndDate ? "T23:59:59" : "T00:00:00"
    return `${year}-${month}-${day}${time}`
  }

  return {
    startdate: formatDateWithTime(startDate, false),
    enddate: formatDateWithTime(endDate, true),
  }
}

function PaymentSearchBox() {
  const defaultDates = getDefaultDateRange()

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transactionType: "",
    transactionId: "",
    transactionAmount: "",
    startdate: defaultDates.startdate,
    enddate: defaultDates.enddate,
  })

  const [isDefaultDates, setIsDefaultDates] = useState(true)

  const queryClient = useQueryClient()
  const { searchByAll, clear: clearTx, isFetching: txFetching } = useTransactionSearchContext()

  useEffect(() => {
    setSearchCriteria((prev) => ({
      ...prev,
      startdate: defaultDates.startdate,
      enddate: defaultDates.enddate,
    }))
  }, [])

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    setSearchCriteria((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (field === "startdate" || field === "enddate") {
      const currentDateStart = searchCriteria.startdate.split("T")[0]
      const currentDateEnd = searchCriteria.enddate.split("T")[0]
      const defaultDateStart = defaultDates.startdate.split("T")[0]
      const defaultDateEnd = defaultDates.enddate.split("T")[0]
      const currentIsDefault = currentDateStart === defaultDateStart && currentDateEnd === defaultDateEnd
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
    // Search requires at least Transaction ID or Transaction Amount
    // Date range and Type are optional filters but not sufficient alone
    return hasId || hasAmount
  }, [validId, searchCriteria.transactionAmount])

  const hasAnyValue = useMemo(() => {
    const hasId = searchCriteria.transactionId.trim() !== ""
    const hasAmount = searchCriteria.transactionAmount.trim() !== ""
    const hasType = searchCriteria.transactionType !== ""
    return hasId || hasAmount || hasType
  }, [searchCriteria.transactionId, searchCriteria.transactionAmount, searchCriteria.transactionType])

  const handleSearch = async () => {
    if (!hasValidSearch) return

    searchByAll({
      transactionType: searchCriteria.transactionType || undefined,
      transactionId: searchCriteria.transactionId.trim() || undefined,
      transactionAmount: searchCriteria.transactionAmount.trim() || undefined,
      startdate: searchCriteria.startdate || undefined,
      enddate: searchCriteria.enddate || undefined,
    })
  }

  const handleClear = async () => {
    setSearchCriteria({
      transactionType: "",
      transactionId: "",
      transactionAmount: "",
      startdate: defaultDates.startdate,
      enddate: defaultDates.enddate,
    })
    setIsDefaultDates(true)

    clearTx()

    await queryClient.invalidateQueries({ queryKey: ["splunk-data"] })
    await queryClient.refetchQueries({ queryKey: ["splunk-data"] })
  }

  const isSearching = txFetching

  const displayDateStart = searchCriteria.startdate.split("T")[0]
  const displayDateEnd = searchCriteria.enddate.split("T")[0]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for a transaction</CardTitle>
          <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-start gap-3 mb-3">
            {/* Transaction Type */}
            <div className="grid items-center gap-1.5 w-48 shrink-0">
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
                {searchCriteria.transactionType && (
                  <span className="text-[10px] text-green-600">Type filter applied</span>
                )}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="grid items-center gap-1.5 w-56 shrink-0">
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
                {!validId && searchCriteria.transactionId && (
                  <span className="text-[10px] text-muted-foreground">Enter a 16-character alphanumeric ID</span>
                )}
              </div>
            </div>

            {/* Transaction Amount */}
            <div className="grid items-center gap-1.5 w-44 shrink-0">
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
                {searchCriteria.transactionAmount.trim() !== "" && (
                  <span className="text-[10px] text-green-600">Amount search enabled</span>
                )}
              </div>
            </div>

            {/* Date Range Start */}
            <div className="grid items-center gap-1.5 w-44 shrink-0">
              <Label htmlFor="date-start" className="whitespace-nowrap">
                Date Range (Start)
              </Label>
              <Input
                type="date"
                id="date-start"
                value={displayDateStart}
                onChange={(e) => {
                  const newValue = `${e.target.value}T00:00:00`
                  handleInputChange("startdate", newValue)
                }}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className={
                  isDefaultDates
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500"
                    : ""
                }
              />
              <div className="h-4 flex items-center">
                {isDefaultDates && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950"
                  >
                    Last 7 days (default)
                  </Badge>
                )}
              </div>
            </div>

            {/* Date Range End */}
            <div className="grid items-center gap-1.5 w-44 shrink-0">
              <Label htmlFor="date-end" className="whitespace-nowrap">
                Date Range (End)
              </Label>
              <Input
                type="date"
                id="date-end"
                value={displayDateEnd}
                onChange={(e) => {
                  const newValue = `${e.target.value}T23:59:59`
                  handleInputChange("enddate", newValue)
                }}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className={
                  isDefaultDates
                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 focus-visible:ring-blue-500"
                    : ""
                }
              />
              <div className="h-4" />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 ml-auto mt-[22px]">
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
