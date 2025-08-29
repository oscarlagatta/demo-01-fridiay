"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ContextArchitectureFlow from "./context-architecture-flow"
import ComponentInteractionFlow from "./component-interaction-flow"

export default function ArchitectureDemoPage() {
  const [selectedView, setSelectedView] = useState<"architecture" | "interaction">("architecture")
  const [selectedContext, setSelectedContext] = useState<"us-wires" | "india" | "generic">("us-wires")

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Context Architecture Strategy</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive strategy for implementing flexible, extensible context architecture that supports multiple
            regions while maintaining backward compatibility.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture Visualization</CardTitle>
            <CardDescription>Explore the new context architecture and component interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-2">
                <Button
                  variant={selectedView === "architecture" ? "default" : "outline"}
                  onClick={() => setSelectedView("architecture")}
                >
                  Context Architecture
                </Button>
                <Button
                  variant={selectedView === "interaction" ? "default" : "outline"}
                  onClick={() => setSelectedView("interaction")}
                >
                  Component Interactions
                </Button>
              </div>

              <Select value={selectedContext} onValueChange={(value: any) => setSelectedContext(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select context type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-wires">US Wires Context</SelectItem>
                  <SelectItem value="india">India Context</SelectItem>
                  <SelectItem value="generic">Generic Context</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flow Diagrams */}
            {selectedView === "architecture" && <ContextArchitectureFlow />}
            {selectedView === "interaction" && <ComponentInteractionFlow />}
          </CardContent>
        </Card>

        {/* Strategy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Base Context Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Generic search operations</li>
                <li>• Loading state management</li>
                <li>• API integration patterns</li>
                <li>• UI state coordination</li>
                <li>• Reusable across regions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">Specific Contexts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Region-specific logic</li>
                <li>• Currency formatting</li>
                <li>• Compliance rules</li>
                <li>• Protocol handling</li>
                <li>• Extends base functionality</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Component Layer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Context-agnostic design</li>
                <li>• Adapter pattern usage</li>
                <li>• Dynamic configuration</li>
                <li>• Seamless switching</li>
                <li>• Backward compatible</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Immediate Benefits</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Zero breaking changes</li>
                  <li>✅ Flexible component design</li>
                  <li>✅ Clear separation of concerns</li>
                  <li>✅ Enhanced testability</li>
                  <li>✅ Improved maintainability</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Long-term Benefits</h4>
                <ul className="space-y-1 text-sm">
                  <li>🚀 Easy regional expansion</li>
                  <li>🚀 Optimized performance</li>
                  <li>🚀 Better developer experience</li>
                  <li>🚀 Reduced code duplication</li>
                  <li>🚀 Scalable architecture</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
