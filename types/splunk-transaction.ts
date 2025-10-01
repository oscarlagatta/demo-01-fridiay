// Shared types matching your screenshots

export type SplunkTransactionDetails = SplunkTransactionDetail[]

export interface SplunkTransactionDetail {
  source: string
  sourceType: string
  _raw: Raw
  aitName?: string // AIT name for transaction identification
  aitNumber?: string // AIT number for transaction tracking
}

export interface Raw {
  WTX_GFD_ID: string
  SMH_SOURCE: string
  SMH_DEST: string
  RQO_TRAN_DATE: string
  RQO_TRAN_TIME: string
  RQO_TRAN_DATE_ALT: string
  RQO_TRAN_TIME_ALT: string
  XQQ_CUST_CNTRY_CODE: string
  AQQ_CUST_A_NUM: string
  AQQ_BILLING_CURR_CODE: string
  TBT_TRAN_TYPE: string
  TBT_REF_NUM: string
  TBT_BILLING_AMT: string
  TBT_MOD_AMT: string
  TBT_SCH_REF_NUM: string
  TPP_CNTRY_CODE: string
  TPP_BANK_CNTRY_CODE: string
  TPP_CUST_A_NUM: string
  TPP_CURR_CODE: string
  TPP_TRAN_AMT: string
  DBA_ENTRY_METHOD: string
  DBA_APPROVAL_TYPE_REQ: string
  RUA_20BYTE_STRING_001: string // transaction id
  RRR_ACTION_CODE: string
  RRR_SCORE: string
  BCC_CPS_CORRELATION: string // transaction id
  REC_CRT_TS: string
  DBA_APPROVED_BY_USERID2: string
  CONTEXT_STATUS?: string // Added CONTEXT_STATUS property to support payment context information
}

// A lightweight normalized summary shape the hook exposes
export interface TransactionSummary {
  id: string
  status: "Approved" | "Rejected" | "Pending"
  amount: number
  currency: string
  date: string // ISO string
  reference: string
  source: string
  counterpartyCountry: string
  score?: number
  aitName?: string
  aitNumber?: string
  metadata: Record<string, string | number | boolean>
}

export interface PaymentContext {
  paymentStatus?: string
  statusCode?: string
  statusMessage?: string
  lastUpdated?: string
  [key: string]: any // Allow for additional context fields
}

// API response shape
export interface TransactionApiResponse {
  id: string
  results: SplunkTransactionDetails
  summary: TransactionSummary
  context?: PaymentContext
}

// Search parameters interface
export interface SearchParams {
  transactionId?: string
  transactionAmount?: string
  dateStart?: string
  dateEnd?: string
}
