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
    throw new Error(`US Wires API Error: ${response.status}`)
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
    throw new Error(`US Wires Amount API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataIndiaGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/india/get-transaction-details?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "IN",
        "X-Currency": "INR",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`India Payment API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataIndiaGetTransactionDetailsByAmountData = async (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/india/get-transaction-details-by-amount?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "IN",
        "X-Currency": "INR",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`India Payment Amount API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataChinaGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/china/get-transaction-details?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "CN",
        "X-Currency": "CNY",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`China Payment API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataChinaGetTransactionDetailsByAmountData = async (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/china/get-transaction-details-by-amount?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "CN",
        "X-Currency": "CNY",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`China Payment Amount API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataInternationalGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/international/get-transaction-details?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "GLOBAL",
        "X-Currency": "MULTI",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`International Wires API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataInternationalGetTransactionDetailsByAmountData = async (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/international/get-transaction-details-by-amount?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "GLOBAL",
        "X-Currency": "MULTI",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`International Wires Amount API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataCardsGetTransactionDetailsData = async (options?: {
  query?: {
    transactionId?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/cards/get-transaction-details?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "GLOBAL",
        "X-Payment-Type": "CARD",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`Card Payments API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}

export const getApiV2SplunkDataCardsGetTransactionDetailsByAmountData = async (options?: {
  query?: {
    transactionAmount?: string
    dateStart?: string
    dateEnd?: string
  }
  throwOnError?: boolean
}) => {
  const response = await fetch(
    "/api/v2/splunk/data/cards/get-transaction-details-by-amount?" + new URLSearchParams(options?.query || {}),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Region": "GLOBAL",
        "X-Payment-Type": "CARD",
      },
    },
  )

  if (!response.ok && options?.throwOnError) {
    throw new Error(`Card Payments Amount API Error: ${response.status}`)
  }

  const data = await response.json()
  return { data }
}
