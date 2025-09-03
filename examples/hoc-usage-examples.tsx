"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useTransactionSearchContext } from "./useTransactionSearchContext"
import { TransactionSearchAdapter } from "./TransactionSearchAdapter"
import { AGGridConfigFactory } from "./AGGridConfigFactory"
import { EnhancedTransactionTable } from "./EnhancedTransactionTable"
import { useUSWiresContext } from "./useUSWiresContext"
import { useIndiaPaymentContext } from "./useIndiaPaymentContext"
import { useCardPaymentContext } from "./useCardPaymentContext"
import { MultiContextAdapter } from "./MultiContextAdapter"
import { FlowSelector } from "./FlowSelector"
import type { FormatterConfig } from "./FormatterConfig"
import { StatusCellRenderer } from "./StatusCellRenderer"
import { AmountCellRenderer } from "./AmountCellRenderer"
import { ActionsCellRenderer } from "./ActionsCellRenderer"
import { AGGridPerformanceOptimizer } from "./AGGridPerformanceOptimizer"

// Example implementations showing different usage patterns

// 1. Basic Usage with Single Context
export const BasicTransactionTable: React.FC = () => {
  const context = useTransactionSearchContext()
  const adapter = new TransactionSearchAdapter(context)
  const config = AGGridConfigFactory.createConfiguration("us-wires")

  return (
    <EnhancedTransactionTable
      adapter={adapter}
      configuration={config}
      onRowClick={(data) => console.log("Row clicked:", data)}
    />
  )
}

// 2. Multi-Context Usage
export const MultiContextTable: React.FC = () => {
  const usWiresContext = useUSWiresContext()
  const indiaContext = useIndiaPaymentContext()
  const cardContext = useCardPaymentContext()

  const multiAdapter = new MultiContextAdapter({
    "us-wires": usWiresContext,
    india: indiaContext,
    card: cardContext,
  })

  const [activeFlow, setActiveFlow] = useState("us-wires")

  useEffect(() => {
    multiAdapter.setActiveContext(activeFlow)
  }, [activeFlow, multiAdapter])

  return (
    <div>
      <FlowSelector onFlowChange={setActiveFlow} />
      <EnhancedTransactionTable
        adapter={multiAdapter}
        configuration={AGGridConfigFactory.createConfiguration(activeFlow)}
      />
    </div>
  )
}

// 3. Custom Formatters and Renderers
export const CustomizedTable: React.FC = () => {
  const context = useTransactionSearchContext()
  const adapter = new TransactionSearchAdapter(context)

  const customFormatters: FormatterConfig = {
    currency: {
      locale: "en-IN",
      defaultCurrency: "INR",
    },
    date: {
      format: "DD/MM/YYYY HH:mm",
      timezone: "Asia/Kolkata",
    },
    amount: {
      precision: 2,
      showCurrency: true,
    },
    custom: {
      status: (value) => value.toUpperCase(),
      reference: (value) => `REF-${value}`,
    },
  }

  const customRenderers = {
    status: StatusCellRenderer,
    amount: AmountCellRenderer,
    actions: ActionsCellRenderer,
  }

  return (
    <EnhancedTransactionTable
      adapter={adapter}
      configuration={AGGridConfigFactory.createConfiguration("india")}
      formatters={customFormatters}
      customRenderers={customRenderers}
    />
  )
}

// 4. Performance Optimized for Large Datasets
export const HighPerformanceTable: React.FC = () => {
  const context = useTransactionSearchContext()
  const adapter = new TransactionSearchAdapter(context)

  const optimizedConfig = useMemo(() => {
    const baseConfig = AGGridConfigFactory.createConfiguration("us-wires")
    return AGGridPerformanceOptimizer.optimizeForLargeDatasets(baseConfig)
  }, [])

  return (
    <EnhancedTransactionTable
      adapter={adapter}
      configuration={optimizedConfig}
      height={600}
      className="high-performance-table"
    />
  )
}
