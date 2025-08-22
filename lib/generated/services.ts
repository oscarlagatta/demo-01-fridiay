export const getApiV2SplunkDataGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
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
