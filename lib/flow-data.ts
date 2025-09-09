import { type Node, type Edge, MarkerType } from "@xyflow/react"
import apiData from "./api-data.json"
import type { SectionTiming } from "@/hooks/use-section-timing"

// Define a custom type for our application's node data, which uses parentId
export type AppNode = Omit<Node, "parentNode"> & {
  parentId?: string
}

export function createBackgroundNodes(sectionTimings?: SectionTiming[]): AppNode[] {
  // Default static data as fallback
  const defaultSections = [
    {
      id: "bg-origination",
      title: "Origination",
      averageTime: 3,
      status: "good" as const,
    },
    {
      id: "bg-validation",
      title: "Payment Validation and Routing",
      averageTime: 3,
      status: "good" as const,
    },
    {
      id: "bg-middleware",
      title: "Middleware",
      averageTime: 30,
      status: "critical" as const,
      unit: "hours" as const,
    },
    {
      id: "bg-processing",
      title: "Payment Processing, Sanctions & Investigation",
      averageTime: 200,
      status: "warning" as const,
    },
  ]

  const sections = sectionTimings || defaultSections

  return sections.map((section, index) => {
    const positions = [
      { x: 0, width: 350 },
      { x: 350, width: 350 },
      { x: 700, width: 450 },
      { x: 1150, width: 500 },
    ]

    const pos = positions[index] || positions[0]

    return {
      id: section.id,
      type: "background",
      position: { x: pos.x, y: 0 },
      data: {
        title: section.title,
        averageTime: `${section.averageTime} ${section.unit || "seconds"}`,
        status: section.status,
      },
      draggable: false,
      selectable: false,
      zIndex: -1,
      style: { width: `${pos.width}px`, height: "960px" },
    }
  })
}

// --- Static Section Definitions ---
const sectionPositions: Record<string, { baseX: number; positions: { x: number; y: number }[] }> = {
  "bg-origination": {
    baseX: 50,
    positions: [
      { x: 50, y: 100 },
      { x: 50, y: 220 },
      { x: 50, y: 340 },
      { x: 50, y: 460 },
      { x: 50, y: 580 },
      { x: 50, y: 700 },
    ],
  },
  "bg-validation": {
    baseX: 425,
    positions: [
      { x: 425, y: 100 },
      { x: 425, y: 220 },
      { x: 425, y: 340 },
      { x: 425, y: 480 },
      { x: 425, y: 590 },
      { x: 425, y: 700 },
    ],
  },
  "bg-middleware": {
    baseX: 750,
    positions: [
      { x: 750, y: 220 },
      { x: 950, y: 400 },
    ],
  },
  "bg-processing": {
    baseX: 1200,
    positions: [
      { x: 1200, y: 160 },
      { x: 1420, y: 160 },
      { x: 1310, y: 300 },
      { x: 1310, y: 420 },
      { x: 1200, y: 580 },
      { x: 1200, y: 700 },
      { x: 1200, y: 820 },
    ],
  },
}

export function transformApiData(sectionTimings?: SectionTiming[]) {
  const backgroundNodes = createBackgroundNodes(sectionTimings)

  const sectionCounters: Record<string, number> = {
    "bg-origination": 0,
    "bg-validation": 0,
    "bg-middleware": 0,
    "bg-processing": 0,
  }

  const transformedNodes: AppNode[] = apiData.nodes
    .map((apiNode): AppNode | null => {
      const parentId = sectionPositions[apiNode.class]?.id
      if (!parentId) return null

      const sectionConfig = sectionPositions[parentId]
      const positionIndex = sectionCounters[parentId]++
      const position = sectionConfig.positions[positionIndex] || {
        x: sectionConfig.baseX,
        y: 100 + positionIndex * 120,
      }

      return {
        id: apiNode.id,
        type: "custom" as const,
        position,
        data: { title: apiNode.data.label, subtext: `AIT ${apiNode.id}` },
        parentId: parentId,
        extent: "parent",
      }
    })
    .filter((n): n is AppNode => n !== null)

  const edgeStyle = { stroke: "#6b7280", strokeWidth: 2 }
  const marker = { type: MarkerType.ArrowClosed, color: "#6b7280" }

  const transformedEdges = apiData.edges.flatMap((apiEdge) => {
    const { source, target } = apiEdge
    if (Array.isArray(target)) {
      // If target is an array, create multiple edges
      return target.map((t) => ({
        id: `${source}-${t}`,
        source: source,
        target: t,
        type: "smoothstep",
        style: edgeStyle, // Use solid line style
        markerStart: marker,
        markerEnd: marker,
      }))
    } else {
      // If target is a single string, create one edge
      return [
        {
          ...apiEdge,
          target: target,
          type: "smoothstep",
          style: edgeStyle, // Use solid line style
          markerStart: marker,
          markerEnd: marker,
        },
      ]
    }
  })

  return {
    nodes: [...backgroundNodes, ...transformedNodes],
    edges: transformedEdges,
  }
}

export function getFlowData(sectionTimings?: SectionTiming[]) {
  return transformApiData(sectionTimings)
}

// Keep legacy exports for backward compatibility
const { nodes, edges } = transformApiData()
export const initialNodes: AppNode[] = nodes
export const initialEdges: Edge[] = edges
