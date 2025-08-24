"use client"

import { FlowDiagram } from "../components/flow-diagram"
import PaymentSearchBox from "../components/payment-search-box"
import { TransactionSearchProvider } from "../components/transaction-search-provider"
import { SearchTestingPanel } from "../components/search-testing-panel"
import { PaymentFlowLayout } from "../components/payment-flow-sidebar"
import { TransactionSearchResultsGrid } from "../components/transaction-search-results-grid"
import { useState } from "react"
import { useTransactionSearchContext } from "../components/transaction-search-provider"

function MainContent() {
  const [showTesting, setShowTesting] = useState(false)
  const { showAmountSearchResults, amountSearchParams, hideAmountResults } = useTransactionSearchContext()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Payment Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Dashboard
            </button>
            <button
              onClick={() => setShowTesting(!showTesting)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showTesting ? "Hide Testing" : "Show Testing"}
            </button>
            <a
              href="/node-manager"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Node Manager
            </a>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Header section with search */}
        <div className="mb-6">
          <PaymentSearchBox />
        </div>

        {showTesting && (
          <div className="mb-6">
            <SearchTestingPanel />
          </div>
        )}

        <div className="bg-white rounded-lg border shadow-sm h-[calc(100vh-200px)]">
          {showAmountSearchResults && amountSearchParams ? (
            <TransactionSearchResultsGrid
              transactionAmount={amountSearchParams.amount}
              dateStart={amountSearchParams.dateStart}
              dateEnd={amountSearchParams.dateEnd}
              onBack={hideAmountResults}
            />
          ) : (
            <FlowDiagram />
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <TransactionSearchProvider>
      <PaymentFlowLayout>
        <MainContent />
      </PaymentFlowLayout>
    </TransactionSearchProvider>
  )
}
