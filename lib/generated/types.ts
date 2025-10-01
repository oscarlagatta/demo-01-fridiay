export interface GetApiV2SplunkDataGetTransactionDetailsDataResponse {
  source: string
  sourceType: string
  aitNumber: string
  aitName: string
  _raw: {
    AIT_NUMBER: string
    AIT_NAME: string
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
    RUA_20BYTE_STRING_001: string
    RRR_ACTION_CODE: string
    RRR_SCORE: string
    BCC_CPS_CORRELATION: string
    REC_CRT_TS: string
    REC_UPD_TS: string
    ELAPSED_TIME_SECONDS: string
    CONTEXT_STATUS?: string
    [key: string]: any
  }
  context?: {
    paymentStatus?: string
    statusCode?: string
    statusMessage?: string
    lastUpdated?: string
    [key: string]: any
  }
}
