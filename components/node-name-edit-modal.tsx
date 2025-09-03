"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import type { Node } from "@xyflow/react"

interface NodeNameEditModalProps {
  isOpen: boolean
  onClose: () => void
  node: Node | null
  onSave: (nodeId: string, updates: { title: string; description?: string }) => void
}

export function NodeNameEditModal({ isOpen, onClose, node, onSave }: NodeNameEditModalProps) {
  const [nodeName, setNodeName] = useState("")
  const [nodeDescription, setNodeDescription] = useState("")
  const [aitNumber, setAitNumber] = useState("")

  useEffect(() => {
    if (node && isOpen) {
      setNodeName(node.data?.title || "")
      setNodeDescription(node.data?.description || "")

      // Extract AIT number from subtext
      const aitMatch = node.data?.subtext?.match(/AIT (\d+)/)
      setAitNumber(aitMatch ? aitMatch[1] : "")
    }
  }, [node, isOpen])

  const handleSave = () => {
    if (!node || !nodeName.trim()) return

    const updates = {
      title: nodeName.trim(),
      description: nodeDescription.trim(),
      lastModified: new Date().toISOString(),
      modifiedBy: "Current User", // This would come from auth context in real app
    }

    onSave(node.id, updates)
    onClose()
  }

  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Node Name</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AIT Number Display */}
          {aitNumber && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">AIT Number:</Label>
              <Badge variant="secondary" className="font-mono">
                AIT {aitNumber}
              </Badge>
              <span className="text-xs text-gray-500">(unchangeable)</span>
            </div>
          )}

          {/* Node Name */}
          <div className="space-y-2">
            <Label htmlFor="node-name">System Name</Label>
            <Input
              id="node-name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Enter system name"
              className="font-medium"
            />
          </div>

          {/* Node Description */}
          <div className="space-y-2">
            <Label htmlFor="node-description">Description (Optional)</Label>
            <Textarea
              id="node-description"
              value={nodeDescription}
              onChange={(e) => setNodeDescription(e.target.value)}
              placeholder="Describe this system's purpose or function..."
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">{nodeName || "System Name"}</div>
              <div className="text-xs text-gray-600 mt-1">{aitNumber ? `AIT ${aitNumber}` : "AIT Number"}</div>
              {nodeDescription && <div className="text-xs text-gray-500 mt-2 italic">{nodeDescription}</div>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!nodeName.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
