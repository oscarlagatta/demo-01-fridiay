import { USWiresProvider, useUSWiresContext } from "./us-wires-context"
import { IndiaPaymentProvider, useIndiaPaymentContext } from "./india-payment-context"
import { CardPaymentsProvider, useCardPaymentsContext } from "./card-payments-context"

// Flow context factory for dynamic usage
export type FlowContextType = "us-wires" | "india" | "card-payments" | "payment-health" | "international-wires"

export const FlowProviders = {
  "us-wires": USWiresProvider,
  india: IndiaPaymentProvider,
  "card-payments": CardPaymentsProvider,
} as const

export const FlowHooks = {
  "us-wires": useUSWiresContext,
  india: useIndiaPaymentContext,
  "card-payments": useCardPaymentsContext,
} as const
