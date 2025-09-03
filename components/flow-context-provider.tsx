"use client"

import React from "react"

import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"

export type FlowType =
  | "us-wires"
  | "india"
  | "payment-health"
  | "international-wires"
  | "card-payments"
  | "china"
  | "taiwan"
  | "malaysia"
  | "korea"

export interface FlowConfig {
  id: FlowType
  name: string
  region?: string
  currency?: string[]
  searchEndpoints?: {
    byId?: string
    byAmount?: string
    byDateRange?: string
  }
  dataFilters?: {
    sourceTypes?: string[]
    aitPatterns?: string[]
    countryCode?: string
  }
}

const FLOW_CONFIGURATIONS: Record<FlowType, FlowConfig> = {
  "us-wires": {
    id: "us-wires",
    name: "US Wires",
    region: "US",
    currency: ["USD"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/get-transaction-details",
      byAmount: "/api/v2/splunk/data/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["us_wire", "domestic_wire"],
      aitPatterns: ["US_*", "WIRE_*"],
      countryCode: "US",
    },
  },
  india: {
    id: "india",
    name: "India Payment Flow",
    region: "APAC",
    currency: ["INR"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/india/get-transaction-details",
      byAmount: "/api/v2/splunk/data/india/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["india_payment", "upi", "imps", "neft"],
      aitPatterns: ["IN_*", "UPI_*", "IMPS_*"],
      countryCode: "IN",
    },
  },
  "payment-health": {
    id: "payment-health",
    name: "Payment Health",
    region: "GLOBAL",
    currency: ["USD", "EUR", "GBP", "INR", "CNY"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/health/get-transaction-details",
      byAmount: "/api/v2/splunk/data/health/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["health_monitor", "system_health"],
      aitPatterns: ["HEALTH_*", "MONITOR_*"],
    },
  },
  "international-wires": {
    id: "international-wires",
    name: "International Wires",
    region: "GLOBAL",
    currency: ["USD", "EUR", "GBP", "JPY", "CHF"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/international/get-transaction-details",
      byAmount: "/api/v2/splunk/data/international/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["international_wire", "swift_wire"],
      aitPatterns: ["INTL_*", "SWIFT_*"],
      countryCode: "MULTI",
    },
  },
  "card-payments": {
    id: "card-payments",
    name: "Card Payments",
    region: "GLOBAL",
    currency: ["USD", "EUR", "GBP"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/cards/get-transaction-details",
      byAmount: "/api/v2/splunk/data/cards/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["card_payment", "visa", "mastercard", "amex"],
      aitPatterns: ["CARD_*", "VISA_*", "MC_*"],
      countryCode: "MULTI",
    },
  },
  china: {
    id: "china",
    name: "China Payment Flow",
    region: "APAC",
    currency: ["CNY"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/china/get-transaction-details",
      byAmount: "/api/v2/splunk/data/china/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["china_payment", "wechat_pay", "alipay", "unionpay"],
      aitPatterns: ["CN_*", "WECHAT_*", "ALIPAY_*"],
      countryCode: "CN",
    },
  },
  taiwan: {
    id: "taiwan",
    name: "Taiwan Payment Flow",
    region: "APAC",
    currency: ["TWD"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/taiwan/get-transaction-details",
      byAmount: "/api/v2/splunk/data/taiwan/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["taiwan_payment", "taiwan_bank"],
      aitPatterns: ["TW_*", "TAIWAN_*"],
      countryCode: "TW",
    },
  },
  malaysia: {
    id: "malaysia",
    name: "Malaysia Payment Flow",
    region: "APAC",
    currency: ["MYR"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/malaysia/get-transaction-details",
      byAmount: "/api/v2/splunk/data/malaysia/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["malaysia_payment", "fpx", "grabpay"],
      aitPatterns: ["MY_*", "FPX_*", "GRAB_*"],
      countryCode: "MY",
    },
  },
  korea: {
    id: "korea",
    name: "Korea Payment Flow",
    region: "APAC",
    currency: ["KRW"],
    searchEndpoints: {
      byId: "/api/v2/splunk/data/korea/get-transaction-details",
      byAmount: "/api/v2/splunk/data/korea/get-transaction-details-by-amount",
    },
    dataFilters: {
      sourceTypes: ["korea_payment", "kakao_pay", "naver_pay"],
      aitPatterns: ["KR_*", "KAKAO_*", "NAVER_*"],
      countryCode: "KR",
    },
  },
}

interface FlowContextValue {
  currentFlow: FlowType
  flowConfig: FlowConfig
  allFlows: FlowConfig[]
  switchFlow: (flowType: FlowType) => void
  isFlowActive: (flowType: FlowType) => boolean
}

const FlowContext = createContext<FlowContextValue | null>(null)

interface FlowContextProviderProps {
  children: ReactNode
  initialFlow?: FlowType
  onFlowChange?: (flowType: FlowType) => void
}

export function FlowContextProvider({ children, initialFlow = "us-wires", onFlowChange }: FlowContextProviderProps) {
  const [currentFlow, setCurrentFlow] = React.useState<FlowType>(initialFlow)

  const switchFlow = React.useCallback(
    (flowType: FlowType) => {
      console.log("[v0] Switching flow context:", { from: currentFlow, to: flowType })
      setCurrentFlow(flowType)
      onFlowChange?.(flowType)
    },
    [currentFlow, onFlowChange],
  )

  const isFlowActive = React.useCallback(
    (flowType: FlowType) => {
      return currentFlow === flowType
    },
    [currentFlow],
  )

  const value = useMemo<FlowContextValue>(
    () => ({
      currentFlow,
      flowConfig: FLOW_CONFIGURATIONS[currentFlow],
      allFlows: Object.values(FLOW_CONFIGURATIONS),
      switchFlow,
      isFlowActive,
    }),
    [currentFlow, switchFlow, isFlowActive],
  )

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlowContext() {
  const context = useContext(FlowContext)
  if (!context) {
    throw new Error("useFlowContext must be used within FlowContextProvider")
  }
  return context
}

export { FLOW_CONFIGURATIONS }
