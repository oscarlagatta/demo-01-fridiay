"use client"

import React, { useEffect, useRef } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { Edit, Settings, Trash2, Plus } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  children: React.ReactNode
}

export function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  // Adjust position to keep menu within viewport
  const adjustedPosition = React.useMemo(() => {
    if (!menuRef.current) return { x, y }

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    // Adjust horizontal position
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10
    }

    return { x: Math.max(10, adjustedX), y: Math.max(10, adjustedY) }
  }, [x, y])

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: "none" }}>
      <Card
        ref={menuRef}
        className="absolute bg-white border shadow-lg min-w-48 py-2"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          pointerEvents: "auto",
        }}
      >
        {children}
      </Card>
    </div>
  )
}

interface ContextMenuItemProps {
  icon?: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

export function ContextMenuItem({
  icon,
  children,
  onClick,
  variant = "default",
  disabled = false,
}: ContextMenuItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start px-3 py-2 h-auto text-sm font-normal ${
        variant === "destructive"
          ? "text-red-600 hover:text-red-700 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2 h-4 w-4 flex items-center justify-center">{icon}</span>}
      {children}
    </Button>
  )
}

export function ContextMenuSeparator() {
  return <Separator className="my-1" />
}

// Node-specific context menu
interface NodeContextMenuProps {
  x: number
  y: number
  nodeId: string
  nodeName: string
  onClose: () => void
  onEditName: (nodeId: string) => void
  onEditEdges: (nodeId: string) => void
  onViewDetails: (nodeId: string) => void
}

export function NodeContextMenu({
  x,
  y,
  nodeId,
  nodeName,
  onClose,
  onEditName,
  onEditEdges,
  onViewDetails,
}: NodeContextMenuProps) {
  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">{nodeName}</div>
      <ContextMenuItem
        icon={<Edit />}
        onClick={() => {
          onEditName(nodeId)
          onClose()
        }}
      >
        Edit Name
      </ContextMenuItem>
      <ContextMenuItem
        icon={<Settings />}
        onClick={() => {
          onEditEdges(nodeId)
          onClose()
        }}
      >
        Modify Connections
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        icon={<Plus />}
        onClick={() => {
          onViewDetails(nodeId)
          onClose()
        }}
      >
        View Details
      </ContextMenuItem>
    </ContextMenu>
  )
}

// Edge-specific context menu
interface EdgeContextMenuProps {
  x: number
  y: number
  edgeId: string
  sourceNode: string
  targetNode: string
  onClose: () => void
  onEditEdge: (edgeId: string) => void
  onDeleteEdge: (edgeId: string) => void
}

export function EdgeContextMenu({
  x,
  y,
  edgeId,
  sourceNode,
  targetNode,
  onClose,
  onEditEdge,
  onDeleteEdge,
}: EdgeContextMenuProps) {
  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
        {sourceNode} → {targetNode}
      </div>
      <ContextMenuItem
        icon={<Edit />}
        onClick={() => {
          onEditEdge(edgeId)
          onClose()
        }}
      >
        Edit Connection
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        icon={<Trash2 />}
        variant="destructive"
        onClick={() => {
          onDeleteEdge(edgeId)
          onClose()
        }}
      >
        Delete Connection
      </ContextMenuItem>
    </ContextMenu>
  )
}
