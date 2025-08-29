"use client"
import ReactFlow, { type Node, type Edge, Background, Controls, MiniMap } from "reactflow"
import "reactflow/dist/style.css"
import { useUsWires, usWiresAdapter } from "./usWires"
import { useIndia, indiaAdapter } from "./india"
import { region } from "./config"

const ComponentInteractionFlow = () => {
  const nodes: Node[] = [
    // Context Switcher
    {
      id: "context-switcher",
      type: "default",
      position: { x: 300, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-indigo-600">ContextSwitcher</div>
            <div className="text-xs text-gray-500">Dynamic context selection</div>
            <div className="text-xs">contextType: "us-wires" | "india"</div>
          </div>
        ),
      },
      style: { width: 220, height: 80, backgroundColor: "#e8eaf6" },
    },

    // Adapters
    {
      id: "us-adapter",
      type: "default",
      position: { x: 100, y: 200 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-blue-600">UsWiresAdapter</div>
            <div className="text-xs">• formatCurrency(USD)</div>
            <div className="text-xs">• getColumns()</div>
            <div className="text-xs">• transformData()</div>
          </div>
        ),
      },
      style: { width: 160, height: 80, backgroundColor: "#e3f2fd" },
    },
    {
      id: "india-adapter",
      type: "default",
      position: { x: 300, y: 200 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-orange-600">IndiaAdapter</div>
            <div className="text-xs">• formatCurrency(INR)</div>
            <div className="text-xs">• getColumns()</div>
            <div className="text-xs">• transformData()</div>
          </div>
        ),
      },
      style: { width: 160, height: 80, backgroundColor: "#fff3e0" },
    },
    {
      id: "generic-adapter",
      type: "default",
      position: { x: 500, y: 200 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-gray-600">GenericAdapter</div>
            <div className="text-xs">• formatCurrency(any)</div>
            <div className="text-xs">• getColumns()</div>
            <div className="text-xs">• transformData()</div>
          </div>
        ),
      },
      style: { width: 160, height: 80, backgroundColor: "#f5f5f5" },
    },

    // AG Grid Component
    {
      id: "flexible-ag-grid",
      type: "default",
      position: { x: 250, y: 350 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-red-600">FlexibleAGGrid</div>
            <div className="text-xs text-gray-500">Context + Adapter injection</div>
            <div className="text-xs">• contextHook: any</div>
            <div className="text-xs">• adapter: ITableAdapter</div>
            <div className="text-xs">• config: TableConfig</div>
          </div>
        ),
      },
      style: { width: 200, height: 100, backgroundColor: "#ffebee" },
    },

    // Usage Examples
    {
      id: "us-usage",
      type: "default",
      position: { x: 50, y: 500 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-purple-600">US Wires Usage</div>
            <div className="text-xs">contextHook={useUsWires}</div>
            <div className="text-xs">adapter={usWiresAdapter}</div>
          </div>
        ),
      },
      style: { width: 180, height: 60, backgroundColor: "#f3e5f5" },
    },
    {
      id: "india-usage",
      type: "default",
      position: { x: 250, y: 500 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-amber-600">India Usage</div>
            <div className="text-xs">contextHook={useIndia}</div>
            <div className="text-xs">adapter={indiaAdapter}</div>
          </div>
        ),
      },
      style: { width: 180, height: 60, backgroundColor: "#fff8e1" },
    },
    {
      id: "dynamic-usage",
      type: "default",
      position: { x: 450, y: 500 },
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold text-teal-600">Dynamic Usage</div>
            <div className="text-xs">contextType={region}</div>
            <div className="text-xs">Auto-adapter selection</div>
          </div>
        ),
      },
      style: { width: 180, height: 60, backgroundColor: "#e0f2f1" },
    },
  ]

  const edges: Edge[] = [
    // Context switcher to adapters
    { id: "switcher-to-us", source: "context-switcher", target: "us-adapter", type: "smoothstep" },
    { id: "switcher-to-india", source: "context-switcher", target: "india-adapter", type: "smoothstep" },
    { id: "switcher-to-generic", source: "context-switcher", target: "generic-adapter", type: "smoothstep" },

    // Adapters to AG Grid
    { id: "us-adapter-to-grid", source: "us-adapter", target: "flexible-ag-grid", type: "smoothstep" },
    { id: "india-adapter-to-grid", source: "india-adapter", target: "flexible-ag-grid", type: "smoothstep" },
    { id: "generic-adapter-to-grid", source: "generic-adapter", target: "flexible-ag-grid", type: "smoothstep" },

    // AG Grid to usage examples
    { id: "grid-to-us-usage", source: "flexible-ag-grid", target: "us-usage", type: "smoothstep" },
    { id: "grid-to-india-usage", source: "flexible-ag-grid", target: "india-usage", type: "smoothstep" },
    { id: "grid-to-dynamic-usage", source: "flexible-ag-grid", target: "dynamic-usage", type: "smoothstep" },
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

export default ComponentInteractionFlow
