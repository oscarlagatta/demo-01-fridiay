"use client"

import { useQuery } from "@tanstack/react-query"
import {
  // US Wires services
  getApiV2SplunkDataGetTransactionDetailsData,
  getApiV2SplunkDataGetTransactionDetailsByAmountData,
  // India services
  getApiV2SplunkDataIndiaGetTransactionDetailsData,
  getApiV2SplunkDataIndiaGetTransactionDetailsByAmountData,
  // China services
  getApiV2SplunkDataChinaGetTransactionDetailsData,
  getApiV2SplunkDataChinaGetTransactionDetailsByAmountData,
  // International Wires services
  getApiV2SplunkDataInternationalGetTransactionDetailsData,
  getApiV2SplunkDataInternationalGetTransactionDetailsByAmountData,
  // Card Payments services
  getApiV2SplunkDataCardsGetTransactionDetailsData,
  getApiV2SplunkDataCardsGetTransactionDetailsByAmountData,
} from "./region-specific-services"

export function useGetSplunkUsWiresTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    queryKey: ["us-wires-transaction-details", { transactionId: txId, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataGetTransactionDetailsData({
        query: { transactionId: txId || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!txId,
  })
}

export function useGetSplunkUsWiresTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
) {
  return useQuery({
    queryKey: ["us-wires-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataGetTransactionDetailsByAmountData({
        query: { transactionAmount: transactionAmount || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!transactionAmount,
  })
}

export function useGetSplunkIndiaTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    queryKey: ["india-transaction-details", { transactionId: txId, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataIndiaGetTransactionDetailsData({
        query: { transactionId: txId || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!txId,
  })
}

export function useGetSplunkIndiaTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
) {
  return useQuery({
    queryKey: ["india-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataIndiaGetTransactionDetailsByAmountData({
        query: { transactionAmount: transactionAmount || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!transactionAmount,
  })
}

export function useGetSplunkChinaTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    queryKey: ["china-transaction-details", { transactionId: txId, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataChinaGetTransactionDetailsData({
        query: { transactionId: txId || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!txId,
  })
}

export function useGetSplunkChinaTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
) {
  return useQuery({
    queryKey: ["china-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataChinaGetTransactionDetailsByAmountData({
        query: { transactionAmount: transactionAmount || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!transactionAmount,
  })
}

export function useGetSplunkInternationalWiresTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    queryKey: ["international-wires-transaction-details", { transactionId: txId, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataInternationalGetTransactionDetailsData({
        query: { transactionId: txId || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!txId,
  })
}

export function useGetSplunkInternationalWiresTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
) {
  return useQuery({
    queryKey: ["international-wires-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataInternationalGetTransactionDetailsByAmountData({
        query: { transactionAmount: transactionAmount || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!transactionAmount,
  })
}

export function useGetSplunkCardPaymentsTransactionDetails(txId: string, dateStart?: string, dateEnd?: string) {
  return useQuery({
    queryKey: ["card-payments-transaction-details", { transactionId: txId, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataCardsGetTransactionDetailsData({
        query: { transactionId: txId || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!txId,
  })
}

export function useGetSplunkCardPaymentsTransactionDetailsByAmount(
  transactionAmount: string,
  dateStart?: string,
  dateEnd?: string,
) {
  return useQuery({
    queryKey: ["card-payments-transaction-details-by-amount", { transactionAmount, dateStart, dateEnd }],
    queryFn: async () => {
      const { data } = await getApiV2SplunkDataCardsGetTransactionDetailsByAmountData({
        query: { transactionAmount: transactionAmount || undefined, dateStart, dateEnd },
        throwOnError: true,
      })
      return data
    },
    enabled: !!transactionAmount,
  })
}
