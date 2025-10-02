import { type Node, type Edge, MarkerType } from "@xyflow/react"
import apiData from "./api-data.json"

export type AppNode = Omit<Node, "parentNode"> & {
  parentId?: string
}

const backgroundNodes: AppNode[] = [
  {
    id: "bg-origination",
    type: "background",
    position: { x: 0, y: 0 },
    data: { title: "Origination" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "380px", height: "900px" },
  },
  {
    id: "bg-validation",
    type: "background",
    position: { x: 460, y: 0 },
    data: { title: "Payment Validation and Routing" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "380px", height: "900px" },
  },
  {
    id: "bg-middleware",
    type: "background",
    position: { x: 920, y: 0 },
    data: { title: "Middleware" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "380px", height: "500px" },
  },
  {
    id: "bg-processing",
    type: "background",
    position: { x: 1380, y: 0 },
    data: { title: "Payment Processing, Sanctions & Investigation" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "520px", height: "900px" },
  },
]

const classToParentId: Record<string, string> = {
  origination: "bg-origination",
  "payment validation and routing": "bg-validation",
  middleware: "bg-middleware",
  "payment processing, sanctions and investigation": "bg-processing",
}

const sectionPositions: Record<string, { positions: { x: number; y: number }[] }> = {
  "bg-origination": {
    positions: [
      { x: 80, y: 80 },
      { x: 80, y: 220 },
      { x: 80, y: 360 },
      { x: 80, y: 500 },
      { x: 80, y: 640 },
      { x: 80, y: 780 },
    ],
  },
  "bg-validation": {
    positions: [
      { x: 80, y: 80 },
      { x: 80, y: 220 },
      { x: 80, y: 360 },
      { x: 80, y: 500 },
      { x: 80, y: 640 },
      { x: 80, y: 780 },
    ],
  },
  "bg-middleware": {
    positions: [
      { x: 80, y: 80 },
      { x: 80, y: 280 },
    ],
  },
  "bg-processing": {
    positions: [
      { x: 60, y: 80 },
      { x: 260, y: 80 },
      { x: 160, y: 240 },
      { x: 160, y: 380 },
      { x: 60, y: 540 },
      { x: 60, y: 680 },
      { x: 260, y: 680 },
    ],
  },
}

function transformApiData() {
  const sectionCounters: Record<string, number> = {
    "bg-origination": 0,
    "bg-validation": 0,
    "bg-middleware": 0,
    "bg-processing": 0,
  }

  const transformedNodes: AppNode[] = apiData.nodes
    .map((apiNode): AppNode | null => {
      const parentId = classToParentId[apiNode.class]
      if (!parentId) return null

      const sectionConfig = sectionPositions[parentId]
      const positionIndex = sectionCounters[parentId]++
      const position = sectionConfig.positions[positionIndex] || {
        x: 80,
        y: 80 + positionIndex * 140,
      }

      return {
        id: apiNode.id,
        type: "custom" as const,
        position, // Position is now relative to parent
        data: { title: apiNode.data.label, subtext: `AIT ${apiNode.id}` },
        parentId: parentId,
        extent: "parent", // Constrain nodes within parent boundaries
        draggable: true, // Allow dragging but constrained to parent
      }
    })
    .filter((n): n is AppNode => n !== null)

  const edgeStyle = { stroke: "#6b7280", strokeWidth: 2 }
  const marker = { type: MarkerType.ArrowClosed, color: "#6b7280" }

  const essentialEdges = new Set([
    "11554-512",
    "48581-4679",
    "41107-28960",
    "70199-28960",
    "70199-515",
    "70199-60745",
    "4679-1901",
    "4679-882",
    "4679-515",
    "28960-15227",
    "28960-4679",
    "15227-834",
    "834-4679",
    "60745-1901",
    "60745-882",
  ])

  const transformedEdges = apiData.edges
    .flatMap((apiEdge) => {
      const { source, target } = apiEdge
      if (Array.isArray(target)) {
        return target.map((t) => ({
          id: `${source}-${t}`,
          source: source,
          target: t,
          type: "smoothstep",
          style: edgeStyle,
          markerEnd: marker,
        }))
      } else {
        return [
          {
            id: apiEdge.id || `${source}-${target}`,
            source: source,
            target: target,
            type: "smoothstep",
            style: edgeStyle,
            markerEnd: marker,
          },
        ]
      }
    })
    .filter((edge) => essentialEdges.has(edge.id)) // Only include essential edges

  return {
    nodes: [...backgroundNodes, ...transformedNodes],
    edges: transformedEdges,
  }
}

const { nodes, edges } = transformApiData()

export const initialNodes: AppNode[] = nodes
export const initialEdges: Edge[] = edges
