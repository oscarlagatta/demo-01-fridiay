"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { X, Plus } from "lucide-react"
import type { Edge, Node } from "@xyflow/react"

interface EdgeModificationModalProps {
  isOpen: boolean
  onClose: () => void
  edge: Edge | null
  nodes: Node[]
  onSave: (edgeId: string, updates: Partial<Edge>) => void
}

interface EdgeDefinition {
  id: string
  label: string
  description: string
}

export function EdgeModificationModal({ isOpen, onClose, edge, nodes, onSave }: EdgeModificationModalProps) {
  const [sourceNodeId, setSourceNodeId] = useState("")
  const [targetNodeId, setTargetNodeId] = useState("")
  const [edgeType, setEdgeType] = useState("smoothstep")
  const [edgeLabel, setEdgeLabel] = useState("")
  const [edgeDescription, setEdgeDescription] = useState("")
  const [edgeDefinitions, setEdgeDefinitions] = useState<EdgeDefinition[]>([])
  const [newDefinitionLabel, setNewDefinitionLabel] = useState("")
  const [newDefinitionDescription, setNewDefinitionDescription] = useState("")

  // Filter out background nodes for source/target selection
  const selectableNodes = nodes.filter((node) => node.type !== "background")

  useEffect(() => {
    if (edge && isOpen) {
      setSourceNodeId(edge.source)
      setTargetNodeId(edge.target)
      setEdgeType(edge.type || "smoothstep")
      setEdgeLabel(edge.label || "")
      setEdgeDescription(edge.data?.description || "")
      setEdgeDefinitions(edge.data?.definitions || [])
    }
  }, [edge, isOpen])

  const handleSave = () => {
    if (!edge) return

    const updates: Partial<Edge> = {
      source: sourceNodeId,
      target: targetNodeId,
      type: edgeType,
      label: edgeLabel,
      data: {
        ...edge.data,
        description: edgeDescription,
        definitions: edgeDefinitions,
        lastModified: new Date().toISOString(),
        modifiedBy: "Current User", // This would come from auth context in real app
      },
    }

    onSave(edge.id, updates)
    onClose()
  }

  const addDefinition = () => {
    if (newDefinitionLabel.trim()) {
      const newDefinition: EdgeDefinition = {
        id: Date.now().toString(),
        label: newDefinitionLabel.trim(),
        description: newDefinitionDescription.trim(),
      }
      setEdgeDefinitions([...edgeDefinitions, newDefinition])
      setNewDefinitionLabel("")
      setNewDefinitionDescription("")
    }
  }

  const removeDefinition = (definitionId: string) => {
    setEdgeDefinitions(edgeDefinitions.filter((def) => def.id !== definitionId))
  }

  const getNodeName = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    return node?.data?.title || nodeId
  }

  if (!edge) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Connection Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-node">Source Node</Label>
                <Select value={sourceNodeId} onValueChange={setSourceNodeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source node" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableNodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.data?.title || node.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-node">Target Node</Label>
                <Select value={targetNodeId} onValueChange={setTargetNodeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target node" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableNodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.data?.title || node.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edge-type">Connection Type</Label>
              <Select value={edgeType} onValueChange={setEdgeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smoothstep">Smooth Step</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="step">Step</SelectItem>
                  <SelectItem value="bezier">Bezier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edge-label">Connection Label</Label>
              <Input
                id="edge-label"
                value={edgeLabel}
                onChange={(e) => setEdgeLabel(e.target.value)}
                placeholder="Enter connection label (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edge-description">Description</Label>
              <Textarea
                id="edge-description"
                value={edgeDescription}
                onChange={(e) => setEdgeDescription(e.target.value)}
                placeholder="Describe this connection..."
                rows={3}
              />
            </div>
          </div>

          {/* Edge Definitions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Connection Definitions</h3>

            {/* Existing Definitions */}
            {edgeDefinitions.length > 0 && (
              <div className="space-y-2">
                <Label>Current Definitions</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {edgeDefinitions.map((definition) => (
                    <div key={definition.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {definition.label}
                          </Badge>
                        </div>
                        {definition.description && (
                          <p className="text-xs text-gray-600 truncate">{definition.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDefinition(definition.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Definition */}
            <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
              <Label className="text-sm font-medium">Add New Definition</Label>
              <div className="space-y-2">
                <Input
                  value={newDefinitionLabel}
                  onChange={(e) => setNewDefinitionLabel(e.target.value)}
                  placeholder="Definition label"
                  className="text-sm"
                />
                <Textarea
                  value={newDefinitionDescription}
                  onChange={(e) => setNewDefinitionDescription(e.target.value)}
                  placeholder="Definition description (optional)"
                  rows={2}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDefinition}
                  disabled={!newDefinitionLabel.trim()}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Definition
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Connection Preview</Label>
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <div className="font-medium text-blue-900">
                {getNodeName(sourceNodeId)} → {getNodeName(targetNodeId)}
              </div>
              {edgeLabel && <div className="text-blue-700 mt-1">Label: {edgeLabel}</div>}
              {edgeDefinitions.length > 0 && (
                <div className="text-blue-700 mt-1">Definitions: {edgeDefinitions.length} defined</div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!sourceNodeId || !targetNodeId}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
