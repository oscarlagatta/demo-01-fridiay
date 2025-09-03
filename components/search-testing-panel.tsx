"use client"

import { useState } from "react"
import { useFlowAwareTransactionSearchContext } from "./flow-aware-transaction-search-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TestResult {
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  data?: any
}

export function SearchTestingPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const searchContext = useFlowAwareTransactionSearchContext()

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Search Context State Validation
    results.push({
      test: "Flow-Aware Search Context State",
      status: searchContext ? "pass" : "fail",
      message: searchContext ? `Context available for ${searchContext.currentFlowName}` : "Context is missing",
      data: {
        active: searchContext?.active,
        currentFlow: searchContext?.currentFlowName,
        hasResults: searchContext?.results?.length > 0,
        hasFilteredResults: searchContext?.flowFilteredResults?.length > 0,
        matchedAitIds: Array.from(searchContext?.matchedAitIds || []),
        supportedCurrencies: searchContext?.supportedCurrencies,
      },
    })

    // Test 2: API Response Structure Validation
    if (searchContext?.flowFilteredResults) {
      const firstResult = searchContext.flowFilteredResults[0]
      const hasRequiredFields = firstResult?.aitNumber && firstResult?.aitName

      results.push({
        test: "Flow-Filtered API Response Structure",
        status: hasRequiredFields ? "pass" : "fail",
        message: hasRequiredFields
          ? "Required fields present in filtered results"
          : "Missing aitNumber or aitName in filtered results",
        data: {
          originalCount: searchContext.results?.length || 0,
          filteredCount: searchContext.flowFilteredResults.length,
          aitNumber: firstResult?.aitNumber,
          aitName: firstResult?.aitName,
          source: firstResult?.source,
          sourceType: firstResult?.sourceType,
        },
      })
    }

    // Test 3: Node AIT ID Extraction
    const nodeElements = document.querySelectorAll('[data-testid^="custom-node-"]')
    const extractedAitIds: string[] = []

    nodeElements.forEach((node) => {
      const subtextElement = node.querySelector('[data-testid="node-subtext"]')
      if (subtextElement) {
        const match = subtextElement.textContent?.match(/AIT (\d+)/)
        if (match) {
          extractedAitIds.push(match[1])
        }
      }
    })

    results.push({
      test: "Node AIT ID Extraction",
      status: extractedAitIds.length > 0 ? "pass" : "fail",
      message: `Extracted ${extractedAitIds.length} AIT IDs from nodes`,
      data: { extractedAitIds: extractedAitIds.slice(0, 10) }, // Show first 10
    })

    // Test 4: Flow-Specific AIT ID Matching Logic
    const matchedIds = Array.from(searchContext?.matchedAitIds || [])
    const hasMatches = matchedIds.length > 0
    const matchingNodes = extractedAitIds.filter((id) => matchedIds.includes(id))

    results.push({
      test: "Flow-Specific AIT ID Matching",
      status: hasMatches ? (matchingNodes.length > 0 ? "pass" : "warning") : "fail",
      message: hasMatches
        ? `${matchingNodes.length} nodes match ${matchedIds.length} flow-filtered search results`
        : "No matched AIT IDs found in current flow",
      data: {
        currentFlow: searchContext?.currentFlowName,
        matchedIds,
        matchingNodes,
        originalResults: searchContext?.results?.length || 0,
        filteredResults: searchContext?.flowFilteredResults?.length || 0,
      },
    })

    // Test 5: Button State Validation
    const buttonStates: any = {}
    nodeElements.forEach((node) => {
      const nodeId = node.getAttribute("data-testid")?.replace("custom-node-", "")
      const buttons = node.querySelectorAll("button")
      const buttonTexts = Array.from(buttons).map((btn) => btn.textContent?.trim())

      if (nodeId) {
        buttonStates[nodeId] = buttonTexts
      }
    })

    const expectedButtonStates = searchContext?.active
      ? searchContext.results?.length > 0
        ? ["Summary", "Details"]
        : ["Loading..."]
      : ["Flow", "Trend", "Balanced"]

    results.push({
      test: "Button State Consistency",
      status: "warning", // Manual inspection needed
      message: `Expected: ${expectedButtonStates.join(", ")}`,
      data: {
        expectedStates: expectedButtonStates,
        actualStates: Object.keys(buttonStates)
          .slice(0, 5)
          .reduce((acc, key) => {
            acc[key] = buttonStates[key]
            return acc
          }, {} as any),
      },
    })

    // Test 6: Search Flow Validation
    const searchFlowValid =
      !searchContext?.active ||
      (searchContext.active && (searchContext.results?.length > 0 || searchContext.isFetching))

    results.push({
      test: "Search Flow State",
      status: searchFlowValid ? "pass" : "fail",
      message: searchFlowValid ? "Search flow state is consistent" : "Search flow state is inconsistent",
      data: {
        active: searchContext?.active,
        isFetching: searchContext?.isFetching,
        hasResults: searchContext?.results?.length > 0,
        hasError: searchContext?.isError,
      },
    })

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "bg-green-500"
      case "fail":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Search Functionality Testing Panel
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? "Running Tests..." : "Run Tests"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{result.message}</p>
              {result.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600">View Data</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
