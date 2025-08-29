"use client"
import ReactFlow, { type Node, type Edge, Background, Controls, MiniMap } from "reactflow"
import "reactflow/dist/style.css"

const ContextArchitectureFlow = () => {
  const nodes: Node[] = [
    // Base Layer
    {
      id: "base-search-context",
      type: "default",
      position: { x: 200, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-blue-600">BaseSearchContext</div>
            <div className="text-xs text-gray-500">Generic search operations</div>
            <div className="text-xs">• Loading states</div>
            <div className="text-xs">• Search parameters</div>
            <div className="text-xs">• API integration</div>
          </div>
        ),
      },
      style: { width: 200, height: 120, backgroundColor: "#e3f2fd" },
    },
    {
      id: "base-ui-context",
      type: "default",
      position: { x: 450, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-green-600">BaseUIContext</div>
            <div className="text-xs text-gray-500">UI state management</div>
            <div className="text-xs">• Modal visibility</div>
            <div className="text-xs">• Selection state</div>
            <div className="text-xs">• Loading coordination</div>
          </div>
        ),
      },
      style: { width: 200, height: 120, backgroundColor: "#e8f5e8" },
    },

    // Specific Context Layer
    {
      id: "us-wires-context",
      type: "default",
      position: { x: 100, y: 250 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-purple-600">UsWiresContext</div>
            <div className="text-xs text-gray-500">US-specific logic</div>
            <div className="text-xs">• USD formatting</div>
            <div className="text-xs">• US regulations</div>
            <div className="text-xs">• Wire protocols</div>
          </div>
        ),
      },
      style: { width: 180, height: 100, backgroundColor: "#f3e5f5" },
    },
    {
      id: "india-context",
      type: "default",
      position: { x: 320, y: 250 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-orange-600">IndiaContext</div>
            <div className="text-xs text-gray-500">India-specific logic</div>
            <div className="text-xs">• INR formatting</div>
            <div className="text-xs">• RBI compliance</div>
            <div className="text-xs">• UPI/NEFT protocols</div>
          </div>
        ),
      },
      style: { width: 180, height: 100, backgroundColor: "#fff3e0" },
    },
    {
      id: "future-context",
      type: "default",
      position: { x: 540, y: 250 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-gray-600">FutureContext</div>
            <div className="text-xs text-gray-500">Extensible for new regions</div>
            <div className="text-xs">• EUR formatting</div>
            <div className="text-xs">• SEPA compliance</div>
            <div className="text-xs">• Regional protocols</div>
          </div>
        ),
      },
      style: { width: 180, height: 100, backgroundColor: "#f5f5f5", border: "2px dashed #ccc" },
    },

    // Component Layer
    {
      id: "ag-grid-component",
      type: "default",
      position: { x: 200, y: 400 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-red-600">AG Grid Component</div>
            <div className="text-xs text-gray-500">Context-agnostic</div>
            <div className="text-xs">• Accepts any context</div>
            <div className="text-xs">• Adapter pattern</div>
            <div className="text-xs">• Dynamic configuration</div>
          </div>
        ),
      },
      style: { width: 200, height: 100, backgroundColor: "#ffebee" },
    },
    {
      id: "other-components",
      type: "default",
      position: { x: 450, y: 400 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-teal-600">Other Components</div>
            <div className="text-xs text-gray-500">Flow, Search, etc.</div>
            <div className="text-xs">• Context injection</div>
            <div className="text-xs">• Seamless switching</div>
            <div className="text-xs">• Backward compatible</div>
          </div>
        ),
      },
      style: { width: 200, height: 100, backgroundColor: "#e0f2f1" },
    },
  ]

  const edges: Edge[] = [
    // Base contexts to specific contexts
    { id: "base-search-to-us", source: "base-search-context", target: "us-wires-context", type: "smoothstep" },
    { id: "base-search-to-india", source: "base-search-context", target: "india-context", type: "smoothstep" },
    {
      id: "base-search-to-future",
      source: "base-search-context",
      target: "future-context",
      type: "smoothstep",
      style: { strokeDasharray: "5,5" },
    },

    { id: "base-ui-to-us", source: "base-ui-context", target: "us-wires-context", type: "smoothstep" },
    { id: "base-ui-to-india", source: "base-ui-context", target: "india-context", type: "smoothstep" },
    {
      id: "base-ui-to-future",
      source: "base-ui-context",
      target: "future-context",
      type: "smoothstep",
      style: { strokeDasharray: "5,5" },
    },

    // Specific contexts to components
    { id: "us-to-ag-grid", source: "us-wires-context", target: "ag-grid-component", type: "smoothstep" },
    { id: "india-to-ag-grid", source: "india-context", target: "ag-grid-component", type: "smoothstep" },
    {
      id: "future-to-ag-grid",
      source: "future-context",
      target: "ag-grid-component",
      type: "smoothstep",
      style: { strokeDasharray: "5,5" },
    },

    { id: "us-to-other", source: "us-wires-context", target: "other-components", type: "smoothstep" },
    { id: "india-to-other", source: "india-context", target: "other-components", type: "smoothstep" },
    {
      id: "future-to-other",
      source: "future-context",
      target: "other-components",
      type: "smoothstep",
      style: { strokeDasharray: "5,5" },
    },
  ]

  return (
    <div className="w-full h-[600px] border rounded-lg">
      <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="bottom-left">
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default ContextArchitectureFlow
