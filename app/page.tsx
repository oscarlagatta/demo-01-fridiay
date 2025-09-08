"use client"

import { FlowDiagram } from "../components/flow-diagram"
import PaymentSearchBox from "../components/payment-search-box"
import { TransactionSearchProvider } from "../components/transaction-search-provider"
import { SearchTestingPanel } from "../components/search-testing-panel"
import { PaymentFlowLayout } from "../components/payment-flow-sidebar"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function HomePage() {
  const [showTesting, setShowTesting] = useState(false)
  const [mode, setMode] = useState<"track-trace" | "observability">("track-trace")

  return (
    <TransactionSearchProvider>
      <PaymentFlowLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-xl font-semibold text-gray-900">US Wires Flow Diagram</h1>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="mode-toggle" className="text-sm font-medium">
                    Track & Trace
                  </Label>
                  <Switch
                    id="mode-toggle"
                    checked={mode === "observability"}
                    onCheckedChange={(checked) => setMode(checked ? "observability" : "track-trace")}
                  />
                  <Label htmlFor="mode-toggle" className="text-sm font-medium">
                    Observability
                  </Label>
                </div>
              </div>
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

          {mode === "observability" && (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payments Completed Today</p>
                    <p className="text-lg font-semibold text-gray-700">12,847</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Transaction Value</p>
                    <p className="text-lg font-semibold text-gray-700">$2.4B</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Errors Detected</p>
                    <p className="text-lg font-semibold text-gray-700">3</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Header section with search - only show in track-trace mode */}
            {mode === "track-trace" && (
              <div className="mb-6">
                <PaymentSearchBox />
              </div>
            )}

            {showTesting && (
              <div className="mb-6">
                <SearchTestingPanel />
              </div>
            )}

            {/* Main diagram section */}
            <div className="bg-white rounded-lg border shadow-sm h-[calc(100vh-200px)]">
              <FlowDiagram mode={mode} />
            </div>
          </div>
        </div>
      </PaymentFlowLayout>
    </TransactionSearchProvider>
  )
}
