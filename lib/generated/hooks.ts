"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getApiV2SplunkDataGetTransactionDetailsData,
  getApiV2SplunkDataGetTransactionDetailsByAmountData,
} from "./services"

export function useGetSplunkUsWiresTransactionDetails(
  txId: string,
  dateStart?: string,
  dateEnd?: string,
  enabled = true,
) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsDataOptions({
      query: {
        transactionId: enabled ? txId || undefined : undefined,
        dateStart: enabled ? dateStart : undefined,
        dateEnd: enabled ? dateEnd : undefined,
      },
    }),
    enabled, // Pass enabled flag to prevent unnecessary API calls
  })
}

export const getApiV2SplunkDataGetTransactionDetailsDataOptions = (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
}) => {
  return {
    queryFn: async ({ queryKey }: { queryKey: any[] }) => {
      const { data } = await getApiV2SplunkDataGetTransactionDetailsData({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      })
      return data
    },
    queryKey: [options],
  }
}

export function useGetSplunkUsWiresTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
  enabled = true,
) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsByAmountDataOptions({
      query: {
        transactionAmount: enabled ? transactionAmount || undefined : undefined,
        dateStart: enabled ? dateStart : undefined,
        dateEnd: enabled ? dateEnd : undefined,
      },
    }),
    enabled, // Pass enabled flag to prevent unnecessary API calls
  })
}

export const getApiV2SplunkDataGetTransactionDetailsByAmountDataOptions = (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
}) => {
  return {
    queryFn: async ({ queryKey }: { queryKey: any[] }) => {
      const { data } = await getApiV2SplunkDataGetTransactionDetailsByAmountData({
        ...options,
        ...queryKey[0],
        throwOnError: true,
      })
      return data
    },
    queryKey: [options],
  }
}
