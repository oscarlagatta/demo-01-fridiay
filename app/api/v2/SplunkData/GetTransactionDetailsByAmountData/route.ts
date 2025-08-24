import { type NextRequest, NextResponse } from "next/server"

const mockTransactionData = [
  {
    source: "farm4_prod_db_GFD",
    sourceType: "E2EUSWireGfdWtxTranInfo",
    aitNumber: "73929",
    aitName: "GFD",
    _raw: {
      AIT_NUMBER: "73929",
      AIT_NAME: "GFD",
      WTX_GFD_ID: "168652803",
      SMH_SOURCE: "CPO",
      SMH_DEST: "FED",
      RQO_TRAN_DATE: "2025-01-15 00:00:00",
      RQO_TRAN_TIME: "10:37:39",
      RQO_TRAN_DATE_ALT: "2025-01-15 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:39",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275731",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202501150031517",
      TBT_BILLING_AMT: "8700",
      TBT_MOD_AMT: "8700",
      TBT_SCH_REF_NUM: "ENFORCE LLC GENERAL ACCOUNT",
      TPP_CNTRY_CODE: "US",
      TPP_BANK_CNTRY_CODE: "US",
      TPP_CUST_A_NUM: "1053613741",
      TPP_CURR_CODE: "USD",
      TPP_TRAN_AMT: "8700",
      DBA_ENTRY_METHOD: "M",
      DBA_APPROVAL_TYPE_REQ: "S",
      RUA_20BYTE_STRING_001: "T0P7R96NFJWBBSTZ",
      RRR_ACTION_CODE: "A",
      RRR_SCORE: "001",
      BCC_CPS_CORRELATION: "T0P7R96NFJWBBSTZ",
      REC_CRT_TS: "2025-01-15 06:57:44.77",
      REC_UPD_TS: "2025-01-15 06:57:44.827",
      ELAPSED_TIME_SECONDS: "0.057",
    },
  },
  {
    source: "farm4_prod_db_CPO",
    sourceType: "E2EUSWireCpoWtxTranInfo",
    aitNumber: "11697",
    aitName: "CPO",
    _raw: {
      AIT_NUMBER: "11697",
      AIT_NAME: "CPO",
      WTX_CPO_ID: "168652804",
      SMH_SOURCE: "GFD",
      SMH_DEST: "CPO",
      RQO_TRAN_DATE: "2025-01-16 00:00:00",
      RQO_TRAN_TIME: "10:37:40",
      RQO_TRAN_DATE_ALT: "2025-01-16 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:40",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275732",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202501160031518",
      TBT_BILLING_AMT: "5200",
      TBT_MOD_AMT: "5200",
      TBT_SCH_REF_NUM: "BUSINESS ACCOUNT",
      TPP_CNTRY_CODE: "US",
      TPP_BANK_CNTRY_CODE: "US",
      TPP_CUST_A_NUM: "1053613742",
      TPP_CURR_CODE: "USD",
      TPP_TRAN_AMT: "5200",
      DBA_ENTRY_METHOD: "M",
      DBA_APPROVAL_TYPE_REQ: "S",
      RUA_20BYTE_STRING_001: "A1B2C3D4E5F6G7H8",
      RRR_ACTION_CODE: "A",
      RRR_SCORE: "002",
      BCC_CPS_CORRELATION: "A1B2C3D4E5F6G7H8",
      REC_CRT_TS: "2025-01-16 06:57:45.12",
      REC_UPD_TS: "2025-01-16 06:57:45.234",
      ELAPSED_TIME_SECONDS: "0.114",
    },
  },
  {
    source: "farm4_prod_db_Swift",
    sourceType: "E2EUSWireSwiftWtxTranInfo",
    aitNumber: "11554",
    aitName: "Swift Gateway",
    _raw: {
      AIT_NUMBER: "11554",
      AIT_NAME: "Swift Gateway",
      WTX_SWIFT_ID: "168652805",
      SMH_SOURCE: "CPO",
      SMH_DEST: "SWIFT",
      RQO_TRAN_DATE: "2025-01-17 00:00:00",
      RQO_TRAN_TIME: "10:37:41",
      RQO_TRAN_DATE_ALT: "2025-01-17 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:41",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275733",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202501170031519",
      TBT_BILLING_AMT: "12500",
      TBT_MOD_AMT: "12500",
      TBT_SCH_REF_NUM: "CORPORATE TRANSFER",
      TPP_CNTRY_CODE: "US",
      TPP_BANK_CNTRY_CODE: "US",
      TPP_CUST_A_NUM: "1053613743",
      TPP_CURR_CODE: "USD",
      TPP_TRAN_AMT: "12500",
      DBA_ENTRY_METHOD: "M",
      DBA_APPROVAL_TYPE_REQ: "S",
      RUA_20BYTE_STRING_001: "X9Y8Z7W6V5U4T3S2",
      RRR_ACTION_CODE: "A",
      RRR_SCORE: "001",
      BCC_CPS_CORRELATION: "X9Y8Z7W6V5U4T3S2",
      REC_CRT_TS: "2025-01-17 06:57:46.45",
      REC_UPD_TS: "2025-01-17 06:57:46.567",
      ELAPSED_TIME_SECONDS: "0.117",
    },
  },
]

function filterByAmount(data: typeof mockTransactionData, transactionAmount: string) {
  const targetAmount = transactionAmount.replace(/[,$]/g, "").trim()

  return data.filter((transaction) => {
    const billingAmount = transaction._raw.TBT_BILLING_AMT
    const tranAmount = transaction._raw.TPP_TRAN_AMT

    return billingAmount === targetAmount || tranAmount === targetAmount
  })
}

function filterByDateRange(data: typeof mockTransactionData, dateStart?: string, dateEnd?: string) {
  if (!dateStart && !dateEnd) return data

  return data.filter((transaction) => {
    const transactionDate = transaction._raw.RQO_TRAN_DATE.split(" ")[0] // Extract date part

    if (dateStart && transactionDate < dateStart) return false
    if (dateEnd && transactionDate > dateEnd) return false

    return true
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const transactionAmount = searchParams.get("transactionAmount")
  const dateStart = searchParams.get("dateStart")
  const dateEnd = searchParams.get("dateEnd")

  console.log("[v0] Amount-based API called with params:", { transactionAmount, dateStart, dateEnd })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!transactionAmount) {
    console.log("[v0] No transaction amount provided, returning empty array")
    return NextResponse.json([])
  }

  // Filter by amount first
  let filteredData = filterByAmount(mockTransactionData, transactionAmount)

  // Then filter by date range if provided
  if (dateStart || dateEnd) {
    filteredData = filterByDateRange(filteredData, dateStart || undefined, dateEnd || undefined)
  }

  console.log("[v0] Returning filtered data by amount and date range:", filteredData.length, "transactions")
  return NextResponse.json(filteredData)
}
