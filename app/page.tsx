"use client"

import { FlowDiagram } from "../components/flow-diagram"
import PaymentSearchBox from "../components/payment-search-box.tsx"
import { TransactionSearchProvider } from "../components/transaction-search-provider"
import { PaymentFlowLayout } from "../components/payment-flow-sidebar"
import { GuidedTour } from "../components/guided-tour"
import { SectionDurationBadge } from "../components/section-duration-badge"

export default function HomePage() {
  return (
    <TransactionSearchProvider>
      <PaymentFlowLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900" data-tour="dashboard-title">
                  Payment Dashboard
                </h1>
                <SectionDurationBadge duration={0.3} sectionName="Navigation" trend="stable" />
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/node-manager"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  data-tour="node-manager"
                >
                  Node Manager
                </a>
              </div>
            </div>
          </nav>

          <div className="p-6">
            {/* Header section with search */}
            <div className="mb-6" data-tour="search-box">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-800">Search & Query</h2>
                <SectionDurationBadge duration={0.8} sectionName="Search" trend="down" />
              </div>
              <PaymentSearchBox />
            </div>

            {/* Main diagram section */}
            <div className="bg-white rounded-lg border shadow-sm h-[calc(100vh-200px)]" data-tour="main-diagram">
              <div className="h-full">
                <FlowDiagram />
              </div>
            </div>
          </div>
        </div>

        <GuidedTour autoStart={true} />
      </PaymentFlowLayout>
    </TransactionSearchProvider>
  )
}
