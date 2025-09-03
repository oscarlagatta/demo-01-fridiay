export const getApiV2SplunkDataGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/SplunkData/GetTransactionDetailsData?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataGetTransactionDetailsByAmountData = async (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/SplunkData/GetTransactionDetailsByAmountData?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}
