"use client"

import { useQuery } from "@tanstack/react-query"
import { getApiV2SplunkDataGetTransactionDetailsData } from "./services"

export function useGetSplunkUsWiresTransactionDetails(txId: string) {
  return useQuery({
    ...getApiV2SplunkDataGetTransactionDetailsDataOptions({
      query: {
        transactionId: txId,
      },
    }),
  })
}

export const getApiV2SplunkDataGetTransactionDetailsDataOptions = (options?: {
  query?: {
    transactionId?: string
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
