"use client"

/**
 * Transaction search hook (HeyAPI integration)
 *
 * Now uses HeyAPI-generated methods to fetch from real Splunk API:
 * - useGetSplunkUsWiresTransactionDetails: Main hook for fetching transaction data
 * - Transforms API response to maintain compatibility with existing UI components
 * - Handles data mapping between new API structure and legacy TransactionSummary format
 */

import { useState, useMemo } from "react"
import { useGetSplunkUsWiresTransactionDetails } from "@/lib/generated/hooks"
import type {
  TransactionApiResponse,
  SplunkTransactionDetails,
  TransactionSummary,
  Raw,
} from "@/types/splunk-transaction"
import type { GetApiV2SplunkDataGetTransactionDetailsDataResponse } from "@/lib/generated/types"

const ID_REGEX = /^[A-Z0-9]{16}$/

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
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
  const dateAlt = (raw.RQO_TRAN_DATE_ALT || "").trim()
  const timeAlt = (raw.RQO_TRAN_TIME_ALT || "").trim()
  const combined = `${dateAlt.split(" ")[0]}T${timeAlt}Z`
  if (!Number.isNaN(Date.parse(combined))) return new Date(combined).toISOString()

  const date = (raw.RQO_TRAN_DATE || "").trim().split(" ")[0]
  const time = (raw.RQO_TRAN_TIME || "").trim()
  const fallback = `${date}T${time}Z`
  return !Number.isNaN(Date.parse(fallback)) ? new Date(fallback).toISOString() : new Date().toISOString()
}

function buildSummary(id: string, results: SplunkTransactionDetails): TransactionSummary {
  const first = results[0]?._raw as Raw | undefined
  const action = first?.RRR_ACTION_CODE
  const status = mapStatus(action)

  const currency = first?.AQQ_BILLING_CURR_CODE || first?.TPP_CURR_CODE || "USD"
  const amount = toNumber(first?.TBT_BILLING_AMT || first?.TPP_TRAN_AMT)

  const date = first ? toIsoDate(first) : new Date().toISOString()
  const reference = first?.TBT_REF_NUM || id
  const source = first?.SMH_SOURCE || "Unknown"
  const counterpartyCountry = first?.TPP_CNTRY_CODE || first?.TPP_BANK_CNTRY_CODE || first?.XQQ_CUST_CNTRY_CODE || "US"
  const score = first?.RRR_SCORE ? Number.parseInt(first.RRR_SCORE, 10) : undefined

  const metadata: Record<string, string | number | boolean> = {
    destination: first?.SMH_DEST || "",
    entryMethod: first?.DBA_ENTRY_METHOD || "",
    approvalType: first?.DBA_APPROVAL_TYPE_REQ || "",
    transactionType: first?.TBT_TRAN_TYPE || "",
    scheduleRef: first?.TBT_SCH_REF_NUM || "",
    approvedBy: first?.DBA_APPROVED_BY_USERID2 || "",
    correlationId: first?.BCC_CPS_CORRELATION || "",
    customerAccount: first?.AQQ_CUST_A_NUM || "",
  }

  return {
    id,
    status,
    amount,
    currency,
    date,
    reference,
    source,
    counterpartyCountry,
    score,
    metadata,
  }
}

function transformApiResponse(
  id: string,
  apiResponse: GetApiV2SplunkDataGetTransactionDetailsDataResponse,
): TransactionApiResponse {
  const results: SplunkTransactionDetails = [
    {
      source: apiResponse.source,
      sourceType: apiResponse.sourceType,
      _raw: apiResponse._raw,
    },
  ]

  const summary = buildSummary(id, results)

  return {
    id,
    results,
    summary,
  }
}

export function useTransactionSearch(defaultId = "") {
  const [queryId, setQueryId] = useState<string>(defaultId.toUpperCase())

  const enabled = useMemo(() => ID_REGEX.test(queryId), [queryId])

  const heyApiQuery = useGetSplunkUsWiresTransactionDetails(queryId)

  const transformedData = useMemo(() => {
    if (!heyApiQuery.data) return undefined
    return transformApiResponse(queryId, heyApiQuery.data)
  }, [heyApiQuery.data, queryId])

  const query = {
    data: transformedData,
    isLoading: heyApiQuery.isLoading,
    isFetching: heyApiQuery.isFetching,
    isError: heyApiQuery.isError,
    error: heyApiQuery.error ? new ApiError(heyApiQuery.error.message, 500) : null,
    refetch: heyApiQuery.refetch,
  }

  const invalidId = useMemo(() => !ID_REGEX.test(queryId) || query.error?.status === 400, [queryId, query.error])
  const notFound = useMemo(() => query.error?.status === 404, [query.error])

  function search(nextId: string) {
    setQueryId(nextId.toUpperCase())
  }

  function reset() {
    setQueryId(defaultId.toUpperCase())
  }

  const results: SplunkTransactionDetails | undefined = query.data?.results
  const summary: TransactionSummary | undefined = query.data?.summary

  return {
    id: queryId,
    results,
    summary,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    invalidId,
    notFound,
    refetch: query.refetch,
    search,
    reset,
  }
}
