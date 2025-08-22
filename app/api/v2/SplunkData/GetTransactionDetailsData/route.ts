import { type NextRequest, NextResponse } from "next/server"

// Mock transaction data that matches the expected API response format
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
      RQO_TRAN_DATE: "2025-07-14 00:00:00",
      RQO_TRAN_TIME: "10:37:39",
      RQO_TRAN_DATE_ALT: "2025-07-14 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:39",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275731",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202507140031517",
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
      REC_CRT_TS: "2025-07-14 06:57:44.77",
      REC_UPD_TS: "2025-07-14 06:57:44.827",
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
      RQO_TRAN_DATE: "2025-07-14 00:00:00",
      RQO_TRAN_TIME: "10:37:40",
      RQO_TRAN_DATE_ALT: "2025-07-14 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:40",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275731",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202507140031517",
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
      REC_CRT_TS: "2025-07-14 06:57:45.12",
      REC_UPD_TS: "2025-07-14 06:57:45.234",
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
      RQO_TRAN_DATE: "2025-07-14 00:00:00",
      RQO_TRAN_TIME: "10:37:41",
      RQO_TRAN_DATE_ALT: "2025-07-14 00:00:00",
      RQO_TRAN_TIME_ALT: "06:37:41",
      XQQ_CUST_CNTRY_CODE: "US",
      AQQ_CUST_A_NUM: "413-375004275731",
      AQQ_BILLING_CURR_CODE: "USD",
      TBT_TRAN_TYPE: "I",
      TBT_REF_NUM: "202507140031517",
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
      REC_CRT_TS: "2025-07-14 06:57:46.45",
      REC_UPD_TS: "2025-07-14 06:57:46.567",
      ELAPSED_TIME_SECONDS: "0.117",
    },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transactionId")

  console.log("[v0] Mock API called with transactionId:", transactionId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data for known test transaction ID
  if (transactionId === "T0P7R96NFJWBBSTZ") {
    console.log("[v0] Returning mock transaction data")
    return NextResponse.json(mockTransactionData)
  }

  // Return empty array for unknown transaction IDs
  console.log("[v0] Transaction ID not found, returning empty array")
  return NextResponse.json([])
}
