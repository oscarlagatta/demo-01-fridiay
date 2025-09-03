"use client"

import { useState, useMemo } from "react"
import type { FlowType } from "@/components/flow-context-provider"
import {
  // US Wires hooks
  useGetSplunkUsWiresTransactionDetails,
  useGetSplunkUsWiresTransactionDetailsByAmount,
  // India hooks
  useGetSplunkIndiaTransactionDetails,
  useGetSplunkIndiaTransactionDetailsByAmount,
  // China hooks
  useGetSplunkChinaTransactionDetails,
  useGetSplunkChinaTransactionDetailsByAmount,
  // International Wires hooks
  useGetSplunkInternationalWiresTransactionDetails,
  useGetSplunkInternationalWiresTransactionDetailsByAmount,
  // Card Payments hooks
  useGetSplunkCardPaymentsTransactionDetails,
  useGetSplunkCardPaymentsTransactionDetailsByAmount,
} from "@/lib/generated/region-specific-hooks"
import type { SplunkTransactionDetails, TransactionSummary, Raw } from "@/types/splunk-transaction"

const ID_REGEX = /^[A-Z0-9]{16}$/

interface SearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}

export function useRegionSpecificTransactionSearch(flowType: FlowType, defaultParams: SearchParams = {}) {
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultParams)

  const enabled = useMemo(() => {
    const hasValidId = searchParams.transactionId && ID_REGEX.test(searchParams.transactionId)
    const hasAmount = searchParams.transactionAmount && searchParams.transactionAmount.trim() !== ""
    const hasDateRange = searchParams.dateStart || searchParams.dateEnd
    return !!(hasValidId || hasAmount || hasDateRange)
  }, [searchParams])

  const useAmountSearch = !!(searchParams.transactionAmount && searchParams.transactionAmount.trim() !== "")

  const getHooksForFlow = (flow: FlowType) => {
    switch (flow) {
      case "us-wires":
        return {
          idHook: useGetSplunkUsWiresTransactionDetails,
          amountHook: useGetSplunkUsWiresTransactionDetailsByAmount,
        }
      case "india":
        return {
          idHook: useGetSplunkIndiaTransactionDetails,
          amountHook: useGetSplunkIndiaTransactionDetailsByAmount,
        }
      case "china":
        return {
          idHook: useGetSplunkChinaTransactionDetails,
          amountHook: useGetSplunkChinaTransactionDetailsByAmount,
        }
      case "international-wires":
        return {
          idHook: useGetSplunkInternationalWiresTransactionDetails,
          amountHook: useGetSplunkInternationalWiresTransactionDetailsByAmount,
        }
      case "card-payments":
        return {
          idHook: useGetSplunkCardPaymentsTransactionDetails,
          amountHook: useGetSplunkCardPaymentsTransactionDetailsByAmount,
        }
      default:
        // Fallback to US Wires for unsupported flows
        return {
          idHook: useGetSplunkUsWiresTransactionDetails,
          amountHook: useGetSplunkUsWiresTransactionDetailsByAmount,
        }
    }
  }

  const { idHook, amountHook } = getHooksForFlow(flowType)

  const idBasedQuery = idHook(searchParams.transactionId || "", searchParams.dateStart, searchParams.dateEnd)

  const amountBasedQuery = amountHook(
    searchParams.transactionAmount || "",
    searchParams.dateStart,
    searchParams.dateEnd,
  )

  // Select the appropriate query based on search type
  const activeQuery = useAmountSearch ? amountBasedQuery : idBasedQuery

  console.log("[v0] Region-specific search hook state:", {
    flowType,
    searchParams,
    enabled,
    useAmountSearch,
    hasData: !!activeQuery.data,
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isError: activeQuery.isError,
    error: activeQuery.error,
  })

  const transformedData = useMemo(() => {
    if (!activeQuery.data) return undefined

    const searchKey =
      searchParams.transactionId ||
      (searchParams.transactionAmount ? `amount_${searchParams.transactionAmount}` : "") ||
      `${searchParams.dateStart || "any"}_to_${searchParams.dateEnd || "any"}`

    // Transform response with flow-specific context
    const responseArray = Array.isArray(activeQuery.data) ? activeQuery.data : [activeQuery.data]

    const results: SplunkTransactionDetails = responseArray
      .filter((item) => item)
      .map((item) => ({
        source: item.source,
        sourceType: item.sourceType,
        aitNumber: item.aitNumber,
        aitName: item.aitName,
        _raw: item._raw,
      }))

    console.log("[v0] Region-specific transformed results:", { flowType, resultsCount: results.length })

    return {
      id: searchKey,
      results,
      summary: buildSummaryForFlow(searchKey, results, flowType),
    }
  }, [activeQuery.data, searchParams, flowType])

  return {
    searchParams,
    results: transformedData?.results,
    summary: transformedData?.summary,
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isError: activeQuery.isError,
    error: activeQuery.error,
    searchById: (id: string) => setSearchParams({ transactionId: id.toUpperCase() }),
    searchByAll: (params: SearchParams) =>
      setSearchParams({
        transactionId: params.transactionId?.toUpperCase(),
        transactionAmount: params.transactionAmount,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd,
      }),
    reset: () => setSearchParams({}),
  }
}

function buildSummaryForFlow(
  searchKey: string,
  results: SplunkTransactionDetails,
  flowType: FlowType,
): TransactionSummary {
  const first = results[0]?._raw as Raw | undefined
  const action = first?.RRR_ACTION_CODE
  const status = mapStatus(action)

  // Flow-specific currency mapping
  const getCurrencyForFlow = (flow: FlowType, raw?: Raw): string => {
    switch (flow) {
      case "india":
        return "INR"
      case "china":
        return "CNY"
      case "us-wires":
        return "USD"
      default:
        return raw?.AQQ_BILLING_CURR_CODE || raw?.TPP_CURR_CODE || "USD"
    }
  }

  const currency = getCurrencyForFlow(flowType, first)
  const amount = toNumber(first?.TBT_BILLING_AMT || first?.TPP_TRAN_AMT)
  const date = first ? toIsoDate(first) : new Date().toISOString()
  const reference = first?.TBT_REF_NUM || searchKey
  const source = first?.SMH_SOURCE || "Unknown"
  const counterpartyCountry =
    first?.TPP_CNTRY_CODE ||
    first?.TPP_BANK_CNTRY_CODE ||
    first?.XQQ_CUST_CNTRY_CODE ||
    getDefaultCountryForFlow(flowType)
  const score = first?.RRR_SCORE ? Number.parseInt(first.RRR_SCORE, 10) : undefined

  return {
    id: searchKey,
    status,
    amount,
    currency,
    date,
    reference,
    source,
    counterpartyCountry,
    score,
    metadata: {
      flowType,
      destination: first?.SMH_DEST || "",
      entryMethod: first?.DBA_ENTRY_METHOD || "",
      approvalType: first?.DBA_APPROVAL_TYPE_REQ || "",
      transactionType: first?.TBT_TRAN_TYPE || "",
    },
  }
}

function mapStatus(code?: string): TransactionSummary["status"] {
  switch ((code || "").toUpperCase()) {
    case "A":
      return "Approved"
    case "R":
      return "Rejected"
    case "P":
      return "Pending"
    default:
      return "Pending"
  }
}

function toNumber(value?: string): number {
  const n = Number.parseFloat((value || "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function toIsoDate(raw: Raw): string {
  if (raw.REC_CRT_TS && !Number.isNaN(Date.parse(raw.REC_CRT_TS))) {
    return new Date(raw.REC_CRT_TS).toISOString()
  }
  return new Date().toISOString()
}

function getDefaultCountryForFlow(flowType: FlowType): string {
  switch (flowType) {
    case "us-wires":
      return "US"
    case "india":
      return "IN"
    case "china":
      return "CN"
    default:
      return "US"
  }
}
