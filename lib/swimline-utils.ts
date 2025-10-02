import type { Node } from "@xyflow/react"
import type { AppNode } from "./flow-data"

export interface SectionBounds {
  x: number
  y: number
  width: number
  height: number
  minX: number
  maxX: number
  minY: number
  maxY: number
}

const SWIMLINE_PADDING = 40 // Padding around nodes within swimline
const SWIMLINE_MIN_WIDTH = 300 // Minimum width for empty sections
const SWIMLINE_MIN_HEIGHT = 200 // Minimum height for empty sections
const SWIMLINE_HEADER_HEIGHT = 60 // Space for section title

/**
 * Calculate dynamic bounding boxes for section background nodes
 * based on the positions and sizes of their child nodes
 */
export function calculateSectionBounds(nodes: Node[] | AppNode[], sectionIds: string[]): Map<string, SectionBounds> {
  const sectionBounds = new Map<string, SectionBounds>()

  // Initialize bounds for each section
  sectionIds.forEach((sectionId) => {
    sectionBounds.set(sectionId, {
      x: 0,
      y: 0,
      width: SWIMLINE_MIN_WIDTH,
      height: SWIMLINE_MIN_HEIGHT,
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    })
  })

  // Find all child nodes for each section and calculate bounds
  nodes.forEach((node) => {
    const parentId = (node as AppNode).parentId || (node as Node).parentNode

    if (parentId && sectionBounds.has(parentId)) {
      const bounds = sectionBounds.get(parentId)!

      // Get node dimensions (default to 224px width, 120px height if not specified)
      const nodeWidth = node.measured?.width || node.width || 224
      const nodeHeight = node.measured?.height || node.height || 120

      // Calculate node boundaries
      const nodeMinX = node.position.x
      const nodeMaxX = node.position.x + nodeWidth
      const nodeMinY = node.position.y
      const nodeMaxY = node.position.y + nodeHeight

      // Update section bounds
      bounds.minX = Math.min(bounds.minX, nodeMinX)
      bounds.maxX = Math.max(bounds.maxX, nodeMaxX)
      bounds.minY = Math.min(bounds.minY, nodeMinY)
      bounds.maxY = Math.max(bounds.maxY, nodeMaxY)
    }
  })

  // Calculate final positions and dimensions with padding
  sectionBounds.forEach((bounds, sectionId) => {
    if (bounds.minX !== Number.POSITIVE_INFINITY) {
      // Section has child nodes - calculate dimensions with padding
      bounds.x = bounds.minX - SWIMLINE_PADDING
      bounds.y = Math.max(0, bounds.minY - SWIMLINE_PADDING - SWIMLINE_HEADER_HEIGHT)
      bounds.width = bounds.maxX - bounds.minX + SWIMLINE_PADDING * 2
      bounds.height = bounds.maxY - bounds.minY + SWIMLINE_PADDING * 2 + SWIMLINE_HEADER_HEIGHT
    } else {
      // Empty section - use minimum dimensions
      bounds.x = 0
      bounds.y = 0
      bounds.width = SWIMLINE_MIN_WIDTH
      bounds.height = SWIMLINE_MIN_HEIGHT
    }
  })

  return sectionBounds
}

/**
 * Update section background nodes with calculated bounds
 */
export function updateSectionNodesWithBounds(
  nodes: Node[] | AppNode[],
  sectionBounds: Map<string, SectionBounds>,
): (Node | AppNode)[] {
  return nodes.map((node) => {
    const bounds = sectionBounds.get(node.id)

    if (bounds && node.type === "background") {
      return {
        ...node,
        position: { x: bounds.x, y: bounds.y },
        style: {
          ...node.style,
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
        },
      }
    }

    return node
  })
}

/**
 * Adjust child node positions to be relative to their parent's new position
 */
export function adjustChildNodePositions(
  nodes: Node[] | AppNode[],
  sectionBounds: Map<string, SectionBounds>,
): (Node | AppNode)[] {
  return nodes.map((node) => {
    const parentId = (node as AppNode).parentId || (node as Node).parentNode

    if (parentId && sectionBounds.has(parentId)) {
      const parentBounds = sectionBounds.get(parentId)!

      // Adjust position to be relative to parent's new position
      return {
        ...node,
        position: {
          x: node.position.x - parentBounds.x,
          y: node.position.y - parentBounds.y,
        },
      }
    }

    return node
  })
}
