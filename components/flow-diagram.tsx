"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  MarkerType,
  ReactFlowProvider,
  type NodeTypes,
  useStore,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"

import { useGetSplunk } from "../hooks/use-get-splunk"
import { initialNodes, initialEdges } from "../lib/flow-data"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import { computeTrafficStatusColors } from "../lib/traffic-status-utils"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { TransactionDetailsTable } from "./transaction-details-table"
import { useTransactionSearchContext } from "./transaction-search-provider"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35]
const GAP_WIDTH = 16

const SECTION_METRICS = {
  "bg-origination": {
    name: "Origination",
    avgTime: 0.8,
    status: "healthy",
    systems: {
      "swift-gateway": 0.3,
      "loan-iq": 0.2,
      "cashpro-mobile": 0.2,
      "cpo-api-gateway": 0.1,
    },
  },
  "bg-validation": {
    name: "Payment Validation & Routing",
    avgTime: 1.2,
    status: "healthy",
    systems: {
      "swift-alliance": 0.4,
      gpo: 0.3,
      "cashpro-payments": 0.3,
      "frp-us": 0.2,
    },
  },
  "bg-middleware": {
    name: "Middleware",
    avgTime: 0.9,
    status: "issue",
    systems: {
      rfi: 0.4,
      mip: 0.5,
    },
  },
  "bg-processing": {
    name: "Payment Processing, Sanctions & Investigation",
    avgTime: 2.1,
    status: "healthy",
    systems: {
      "grs-amer": 0.8,
      "gcms-gumbo": 0.6,
      "ets-gumshoe": 0.4,
      "grs-fraud": 0.3,
    },
  },
}

const MOCK_TRANSACTION_RESULT = {
  transactionId: "TXN-2024-001234",
  status: "Processed",
  outcome: "Completed in WTX → sent to Fed",
  path: ["swift-gateway", "swift-alliance", "gpo", "rfi", "mip", "grs-amer", "gcms-gumbo"],
}

interface FlowProps {
  mode: "track-trace" | "observability"
}

const Flow = ({ mode }: FlowProps) => {
  const { showTableView } = useTransactionSearchContext()
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set())
  const [lastRefetch, setLastRefetch] = useState<Date | null>(null)
  const [showTransactionResult, setShowTransactionResult] = useState(false)
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  const { data: splunkData, isLoading, isError, error, refetch, isFetching, isSuccess } = useGetSplunk()

  const getNodeTimingData = useCallback((nodeId: string) => {
    for (const [sectionId, sectionData] of Object.entries(SECTION_METRICS)) {
      if (sectionData.systems[nodeId]) {
        return {
          avgTime: sectionData.systems[nodeId],
          sectionAvg: sectionData.avgTime,
          sectionName: sectionData.name,
        }
      }
    }
    return null
  }, [])

  const handleTransactionSearch = useCallback((transactionId: string) => {
    if (transactionId.trim()) {
      setHighlightedPath(MOCK_TRANSACTION_RESULT.path)
      setShowTransactionResult(true)
    } else {
      setHighlightedPath([])
      setShowTransactionResult(false)
    }
  }, [])

  useEffect(() => {
    const handleSearch = (event: CustomEvent) => {
      handleTransactionSearch(event.detail.transactionId)
    }

    window.addEventListener("transactionSearch", handleSearch as EventListener)
    return () => window.removeEventListener("transactionSearch", handleSearch as EventListener)
  }, [handleTransactionSearch])

  const handleRefetch = async () => {
    try {
      await refetch()
      setLastRefetch(new Date())
    } catch (error) {
      console.error("Refetch failed:", error)
    }
  }

  const findConnections = useCallback(
    (nodeId: string) => {
      const connectedNodes = new Set<string>()
      const connectedEdges = new Set<string>()

      edges.forEach((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          connectedEdges.add(edge.id)
          if (edge.source === nodeId) {
            connectedNodes.add(edge.target)
          }
          if (edge.target === nodeId) {
            connectedNodes.add(edge.source)
          }
        }
      })

      return { connectedNodes, connectedEdges }
    },
    [edges],
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (isLoading || isFetching) return

      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
        setConnectedNodeIds(new Set())
        setConnectedEdgeIds(new Set())
      } else {
        const { connectedNodes, connectedEdges } = findConnections(nodeId)
        setSelectedNodeId(nodeId)
        setConnectedNodeIds(connectedNodes)
        setConnectedEdgeIds(connectedEdges)
      }
    },
    [selectedNodeId, findConnections, isLoading, isFetching],
  )

  const getConnectedSystemNames = useCallback(() => {
    if (!selectedNodeId) return []

    return Array.from(connectedNodeIds)
      .map((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId)
        return node?.data?.title || nodeId
      })
      .sort()
  }, [selectedNodeId, connectedNodeIds, nodes])

  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((currentNodes) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0

        const newNodes = [...currentNodes]
        const sectionDimensions: Record<string, { x: number; width: number }> = {}

        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
            sectionDimensions[sectionId] = { x: currentX, width: sectionWidth }

            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: { x: currentX, y: 0 },
              style: {
                ...newNodes[nodeIndex].style,
                width: `${sectionWidth}px`,
                height: `${height}px`,
              },
            }
            currentX += sectionWidth + GAP_WIDTH
          }
        }

        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]
          if (node.parentId && sectionDimensions[node.parentId]) {
            const parentDimensions = sectionDimensions[node.parentId]

            const originalNode = initialNodes.find((n) => n.id === node.id)
            const originalParent = initialNodes.find((n) => n.id === node.parentId)

            if (originalNode && originalParent && originalParent.style?.width) {
              const originalParentWidth = Number.parseFloat(originalParent.style.width as string)
              const originalRelativeXOffset = originalNode.position.x - originalParent.position.x

              const newAbsoluteX =
                parentDimensions.x + (originalRelativeXOffset / originalParentWidth) * parentDimensions.width

              newNodes[i] = {
                ...node,
                position: {
                  x: newAbsoluteX,
                  y: node.position.y,
                },
              }
            }
          }
        }
        return newNodes
      })
    }
  }, [width, height])

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes])

  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges])

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerStart: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            style: { strokeWidth: 2, stroke: "#6b7280" },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  const nodesForFlow = useMemo(() => {
    return nodes.map((node) => {
      const isSelected = selectedNodeId === node.id
      const isConnected = connectedNodeIds.has(node.id)
      const isDimmed = selectedNodeId && !isSelected && !isConnected
      const isHighlighted = mode === "track-trace" && highlightedPath.includes(node.id)

      const timingData = mode === "observability" ? getNodeTimingData(node.id) : null

      const nodeData = {
        ...node.data,
        isSelected,
        isConnected,
        isDimmed,
        isHighlighted,
        onClick: handleNodeClick,
        mode,
        timingData,
      }

      if (node.parentId) {
        const { parentId, ...rest } = node
        return {
          ...rest,
          parentNode: parentId,
          data: nodeData,
        }
      }
      return {
        ...(node as Node),
        data: nodeData,
      }
    })
  }, [nodes, selectedNodeId, connectedNodeIds, handleNodeClick, mode, highlightedPath, getNodeTimingData])

  const edgesForFlow = useMemo(() => {
    return edges.map((edge) => {
      const isConnected = connectedEdgeIds.has(edge.id)
      const isDimmed = selectedNodeId && !isConnected
      const isHighlighted =
        mode === "track-trace" && highlightedPath.includes(edge.source) && highlightedPath.includes(edge.target)

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected || isHighlighted ? 3 : 2,
          stroke: isHighlighted ? "#3b82f6" : isConnected ? "#1d4ed8" : isDimmed ? "#d1d5db" : "#6b7280",
          opacity: isDimmed ? 0.3 : 1,
        },
        animated: isConnected || isHighlighted,
      }
    })
  }, [edges, connectedEdgeIds, selectedNodeId, mode, highlightedPath])

  const renderDataPanel = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Loading Splunk data...</span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error loading data</span>
          </div>
          <p className="text-sm text-red-500">{error?.message || "Failed to load Splunk data"}</p>
          <Button
            onClick={handleRefetch}
            size="sm"
            variant="outline"
            disabled={isFetching}
            className="w-full border-red-200 hover:border-red-300 hover:bg-red-50 bg-transparent"
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      )
    }

    if (isSuccess && splunkData) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium mb-1">Traffic Status Summary:</h4>
            <div className="flex items-center gap-1">
              {isFetching && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              <Button
                onClick={handleRefetch}
                size="sm"
                variant="ghost"
                disabled={isFetching}
                className="h-5 w-5 p-0 hover:bg-blue-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {Object.entries(computeTrafficStatusColors(splunkData)).map(([aitNum, color]) => (
              <div key={aitNum} className="flex justify-between">
                <span>AIT {aitNum}:</span>
                <span
                  className={`px-1 rounded text-white ${
                    color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-gray-400"
                  }`}
                >
                  {color}
                </span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-medium mb-1">Raw Data (first 5 entries):</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(splunkData.slice(0, 5), null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    return null
  }

  if (showTableView) {
    return <TransactionDetailsTable />
  }

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {lastRefetch && !isFetching && (
          <span className="text-xs text-muted-foreground">Last updated: {lastRefetch.toLocaleTimeString()}</span>
        )}
        <Button
          onClick={handleRefetch}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-sm border-blue-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
          title="Refresh Splunk data"
          aria-label="Refresh Splunk data"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {mode === "observability" && (
        <div className="absolute top-4 left-4 z-10 space-y-2 max-w-xs">
          {Object.entries(SECTION_METRICS).map(([sectionId, metrics]) => (
            <Card key={sectionId} className="w-72 shadow-sm bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="truncate">{metrics.name}</span>
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${metrics.status === "healthy" ? "bg-green-500" : "bg-red-500"}`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Section Avg: {metrics.avgTime}s</span>
                  </div>
                  <span className="text-xs text-gray-500">{Object.keys(metrics.systems).length} systems</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReactFlow
        nodes={nodesForFlow}
        edges={edgesForFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        className="bg-white"
        style={{ background: "#eeeff3ff" }}
        panOnDrag={false}
        elementsSelectable={false}
        minZoom={1}
        maxZoom={1}
      >
        <Controls />
        <Background gap={16} size={1} />
      </ReactFlow>

      {mode === "track-trace" && showTransactionResult && (
        <div className="absolute bottom-4 left-4 z-10 max-w-md bg-white border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Transaction Result</h3>
            <button
              onClick={() => {
                setShowTransactionResult(false)
                setHighlightedPath([])
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Transaction ID:</span>
              <span className="text-xs text-gray-900">{MOCK_TRANSACTION_RESULT.transactionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Status:</span>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">{MOCK_TRANSACTION_RESULT.status}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-600">Outcome:</span>
              <p className="text-xs text-gray-700 mt-1">{MOCK_TRANSACTION_RESULT.outcome}</p>
            </div>
          </div>
        </div>
      )}

      {mode === "track-trace" && selectedNodeId && !showTransactionResult && (
        <div className="absolute top-4 left-4 z-10 max-w-sm bg-white border rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-800">
            Selected System: {nodes.find((n) => n.id === selectedNodeId)?.data?.title}
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Connected Systems ({connectedNodeIds.size}):</h4>
              <div className="max-h-32 overflow-y-auto">
                {getConnectedSystemNames().map((systemName, index) => (
                  <div key={index} className="text-xs text-gray-700 py-1 px-2 bg-blue-50 rounded mb-1">
                    {systemName}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleNodeClick(selectedNodeId)}
              className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              disabled={isLoading || isFetching}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function FlowDiagram({ mode = "track-trace" }: { mode?: "track-trace" | "observability" }) {
  return (
    <ReactFlowProvider>
      <Flow mode={mode} />
    </ReactFlowProvider>
  )
}
