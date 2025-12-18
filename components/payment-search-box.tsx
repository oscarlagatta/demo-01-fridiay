"use client"

import type React from "react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Calendar, Loader2 } from "lucide-react"
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

type DatePreset = "7days" | "30days" | "thisMonth" | "custom"

function getDateRangeForPreset(preset: DatePreset): { startdate: string; enddate: string } {
  const endDate = new Date()
  const startDate = new Date()

  const formatDateWithTime = (date: Date, isEndDate = false): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const time = isEndDate ? "T23:59:59" : "T00:00:00"
    return `${year}-${month}-${day}${time}`
  }

  switch (preset) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7)
      break
    case "30days":
      startDate.setDate(startDate.getDate() - 30)
      break
    case "thisMonth":
      startDate.setDate(1) // First day of current month
      break
    default:
      return { startdate: "", enddate: "" }
  }

  return {
    startdate: formatDateWithTime(startDate, false),
    enddate: formatDateWithTime(endDate, true),
  }
}

function getDefaultDateRange() {
  return getDateRangeForPreset("7days")
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

  const [activePreset, setActivePreset] = useState<DatePreset>("7days")

  const queryClient = useQueryClient()
  const { searchByAll, clear: clearTx, cancel, isFetching: txFetching } = useTransactionSearchContext()

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
      setActivePreset("custom")
    }
  }

  const handlePresetClick = (preset: DatePreset) => {
    const dateRange = getDateRangeForPreset(preset)
    setSearchCriteria((prev) => ({
      ...prev,
      startdate: dateRange.startdate,
      enddate: dateRange.enddate,
    }))
    setActivePreset(preset)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasValidSearch && !isSearching) {
      handleSearch()
    }
    if (e.key === "Escape" && isSearching) {
      handleCancel()
    }
  }

  const validId = useMemo(
    () => ID_REGEX.test((searchCriteria.transactionId || "").trim().toUpperCase()),
    [searchCriteria.transactionId],
  )

  const hasValidSearch = useMemo(() => {
    const hasId = validId
    const hasAmount = searchCriteria.transactionAmount.trim() !== ""
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
    setActivePreset("7days")

    clearTx()

    await queryClient.invalidateQueries({ queryKey: ["splunk-data"] })
    await queryClient.refetchQueries({ queryKey: ["splunk-data"] })
  }

  const handleCancel = () => {
    cancel()
  }

  const isSearching = txFetching

  const displayDateStart = searchCriteria.startdate.split("T")[0]
  const displayDateEnd = searchCriteria.enddate.split("T")[0]

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearching) {
        handleCancel()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isSearching])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Search for a transaction</CardTitle>
          <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Quick Select:
              </Label>
              <Button
                variant={activePreset === "7days" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("7days")}
                disabled={isSearching}
                className="h-8"
              >
                Last 7 Days
              </Button>
              <Button
                variant={activePreset === "30days" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("30days")}
                disabled={isSearching}
                className="h-8"
              >
                Last 30 Days
              </Button>
              <Button
                variant={activePreset === "thisMonth" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick("thisMonth")}
                disabled={isSearching}
                className="h-8"
              >
                This Month
              </Button>
              {activePreset === "custom" && (
                <Badge variant="secondary" className="h-8 px-3">
                  Custom Range
                </Badge>
              )}
            </div>

            {/* Search fields */}
            <div className="flex flex-wrap items-start gap-3">
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
                />
                <div className="h-4" />
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
                />
                <div className="h-4" />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 ml-auto mt-[22px]">
                {isSearching ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground animate-pulse">Searching...</span>
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      className="flex items-center gap-2 min-w-[140px]"
                      size="default"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancel Search
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSearch}
                    disabled={!hasValidSearch}
                    className="flex items-center gap-2 min-w-[140px]"
                    size="default"
                  >
                    <Search className="h-4 w-4" />
                    Search Transaction
                  </Button>
                )}
                {/* End of change */}

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

            {isSearching && (
              <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border">ESC</kbd>
                <span>to cancel</span>
              </div>
            )}
            {/* End of change */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentSearchBox
