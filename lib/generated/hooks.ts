"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getApiV2SplunkDataGetTransactionDetailsData,
  getApiV2SplunkDataGetTransactionDetailsByAmountData,
} from "./services"

export function useGetSplunkUsWiresTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsDataOptions({
      query: {
        transactionId: txId || undefined,
        dateStart,
        dateEnd,
      },
    }),
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
) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsByAmountDataOptions({
      query: {
        transactionAmount: transactionAmount || undefined,
        dateStart,
        dateEnd,
      },
    }),
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
