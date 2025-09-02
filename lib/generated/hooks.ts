"use client"

import { useQuery } from "@tanstack/react-query"
import type { GetApiV2SplunkDataGetTransactionDetailsDataResponse } from "./types"

export function useGetSplunkUsWiresTransactionDetails(
  txId: string,
  dateStart?: string,
  dateEnd?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["splunk-transaction-details", { txId, dateStart, dateEnd }],
    queryFn: async (): Promise<GetApiV2SplunkDataGetTransactionDetailsDataResponse[]> => {
      const params = new URLSearchParams()
      if (enabled && txId) params.append("transactionId", txId)
      if (enabled && dateStart) params.append("dateStart", dateStart)
      if (enabled && dateEnd) params.append("dateEnd", dateEnd)

      const response = await fetch(`/api/v2/SplunkData/GetTransactionDetailsData?${params}`)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : [data]
    },
    enabled,
  })
}

export function useGetSplunkUsWiresTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["splunk-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async (): Promise<GetApiV2SplunkDataGetTransactionDetailsDataResponse[]> => {
      const params = new URLSearchParams()
      if (enabled && transactionAmount) params.append("transactionAmount", transactionAmount)
      if (enabled && dateStart) params.append("dateStart", dateStart)
      if (enabled && dateEnd) params.append("dateEnd", dateEnd)

      const response = await fetch(`/api/v2/SplunkData/GetTransactionDetailsByAmountData?${params}`)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : [data]
    },
    enabled,
  })
}
