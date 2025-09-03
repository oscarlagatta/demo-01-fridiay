"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import type React from "react"

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
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"

import { useGetSplunk } from "../hooks/use-get-splunk"
import { initialNodes, initialEdges } from "../lib/flow-data"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import { computeTrafficStatusColors } from "../lib/traffic-status-utils"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { TransactionDetailsTable } from "./transaction-details-table"
import { useTransactionSearchContext } from "./transaction-search-provider"
import { NodeContextMenu, EdgeContextMenu } from "./context-menu"
import { EdgeModificationModal } from "./edge-modification-modal"
import { NodeNameEditModal } from "./node-name-edit-modal"
import { ChangeHistoryPanel } from "./change-history-panel"
import { useChangeTrackingContext } from "./change-tracking-provider"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35]
const GAP_WIDTH = 16

const Flow = () => {
  const { showTableView } = useTransactionSearchContext()
  const { trackChange } = useChangeTrackingContext()
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set())
  const [lastRefetch, setLastRefetch] = useState<Date | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    type: "node" | "edge"
    x: number
    y: number
    nodeId?: string
    edgeId?: string
    sourceNode?: string
    targetNode?: string
  } | null>(null)
  const [edgeModalOpen, setEdgeModalOpen] = useState(false)
  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  const { data: splunkData, isLoading, isError, error, refetch, isFetching, isSuccess } = useGetSplunk()

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

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()

    if (node.type === "background") return

    setContextMenu({
      type: "node",
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    })
  }, [])

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()

      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      setContextMenu({
        type: "edge",
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
        sourceNode: sourceNode?.data?.title || edge.source,
        targetNode: targetNode?.data?.title || edge.target,
      })
    },
    [nodes],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleEditNodeName = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        setSelectedNode(node)
        setNodeModalOpen(true)
      }
    },
    [nodes],
  )

  const handleEditNodeEdges = useCallback(
    (nodeId: string) => {
      console.log("[v0] Edit edges for node:", nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        const connectedEdges = edges.filter((edge) => edge.source === nodeId || edge.target === nodeId)

        if (connectedEdges.length > 0) {
          setSelectedEdge(connectedEdges[0])
          setEdgeModalOpen(true)
        } else {
          console.log("[v0] No edges found for node:", nodeId)
        }
      }
    },
    [nodes, edges],
  )

  const handleViewNodeDetails = useCallback(
    (nodeId: string) => {
      handleNodeClick(nodeId)
    },
    [handleNodeClick],
  )

  const handleEditEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId)
      if (edge) {
        setSelectedEdge(edge)
        setEdgeModalOpen(true)
      }
    },
    [edges],
  )

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId)
      if (edge) {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)
        const edgeName = `${sourceNode?.data?.title || edge.source} → ${targetNode?.data?.title || edge.target}`

        trackChange("edge", edgeId, edgeName, "deleted")
        setEdges((eds) => eds.filter((e) => e.id !== edgeId))
      }
    },
    [edges, nodes, trackChange],
  )

  const handleSaveNode = useCallback(
    (nodeId: string, updates: { title: string; description?: string }) => {
      const oldNode = nodes.find((n) => n.id === nodeId)
      if (!oldNode) return

      const changes: Record<string, { from: any; to: any }> = {}
      if (oldNode.data.title !== updates.title) {
        changes.title = { from: oldNode.data.title, to: updates.title }
      }
      if (oldNode.data.description !== updates.description) {
        changes.description = { from: oldNode.data.description || "", to: updates.description || "" }
      }

      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  title: updates.title,
                  description: updates.description,
                  lastModified: new Date().toISOString(),
                  modifiedBy: "Current User",
                },
              }
            : node,
        ),
      )

      trackChange("node", nodeId, updates.title, "updated", changes)
      setNodeModalOpen(false)
      setSelectedNode(null)
    },
    [nodes, trackChange],
  )

  const handleSaveEdge = useCallback(
    (edgeId: string, updates: Partial<Edge>) => {
      const oldEdge = edges.find((e) => e.id === edgeId)
      if (!oldEdge) return

      const changes: Record<string, { from: any; to: any }> = {}
      Object.keys(updates).forEach((key) => {
        if (key !== "data" && oldEdge[key as keyof Edge] !== updates[key as keyof Edge]) {
          changes[key] = { from: oldEdge[key as keyof Edge], to: updates[key as keyof Edge] }
        }
      })

      setEdges((eds) => eds.map((edge) => (edge.id === edgeId ? { ...edge, ...updates } : edge)))

      const sourceNode = nodes.find((n) => n.id === (updates.source || oldEdge.source))
      const targetNode = nodes.find((n) => n.id === (updates.target || oldEdge.target))
      const edgeName = `${sourceNode?.data?.title || updates.source || oldEdge.source} → ${targetNode?.data?.title || updates.target || oldEdge.target}`

      trackChange("edge", edgeId, edgeName, "updated", changes)
      setEdgeModalOpen(false)
      setSelectedEdge(null)
    },
    [edges, nodes, trackChange],
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

      const nodeData = {
        ...node.data,
        isSelected,
        isConnected,
        isDimmed,
        onClick: handleNodeClick,
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
  }, [nodes, selectedNodeId, connectedNodeIds, handleNodeClick])

  const edgesForFlow = useMemo(() => {
    return edges.map((edge) => {
      const isConnected = connectedEdgeIds.has(edge.id)
      const isDimmed = selectedNodeId && !isConnected

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected ? 3 : 2,
          stroke: isConnected ? "#1d4ed8" : isDimmed ? "#d1d5db" : "#6b7280",
          opacity: isDimmed ? 0.3 : 1,
        },
        animated: isConnected,
      }
    })
  }, [edges, connectedEdgeIds, selectedNodeId])

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

      <ReactFlow
        nodes={nodesForFlow}
        edges={edgesForFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
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

      {selectedNodeId && (
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

      <div className="absolute bottom-4 right-4 z-10 w-80">
        <ChangeHistoryPanel
          entityId={selectedNodeId || undefined}
          entityName={selectedNodeId ? nodes.find((n) => n.id === selectedNodeId)?.data?.title : undefined}
        />
      </div>

      {contextMenu && contextMenu.type === "node" && contextMenu.nodeId && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          nodeName={nodes.find((n) => n.id === contextMenu.nodeId)?.data?.title || contextMenu.nodeId}
          onClose={closeContextMenu}
          onEditName={handleEditNodeName}
          onEditEdges={handleEditNodeEdges}
          onViewDetails={handleViewNodeDetails}
        />
      )}

      {contextMenu && contextMenu.type === "edge" && contextMenu.edgeId && (
        <EdgeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          edgeId={contextMenu.edgeId}
          sourceNode={contextMenu.sourceNode || ""}
          targetNode={contextMenu.targetNode || ""}
          onClose={closeContextMenu}
          onEditEdge={handleEditEdge}
          onDeleteEdge={handleDeleteEdge}
        />
      )}

      <EdgeModificationModal
        isOpen={edgeModalOpen}
        onClose={() => {
          setEdgeModalOpen(false)
          setSelectedEdge(null)
        }}
        edge={selectedEdge}
        nodes={nodes}
        onSave={handleSaveEdge}
      />

      <NodeNameEditModal
        isOpen={nodeModalOpen}
        onClose={() => {
          setNodeModalOpen(false)
          setSelectedNode(null)
        }}
        node={selectedNode}
        onSave={handleSaveNode}
      />
    </div>
  )
}

export function FlowDiagram() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
