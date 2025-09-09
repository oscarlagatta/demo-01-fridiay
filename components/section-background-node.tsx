import type { NodeProps, Node } from "@xyflow/react"

type SectionBackgroundNodeData = {
  title: string
  color: string
  isDimmed?: boolean
  averageTime?: string
  status?: "good" | "warning" | "critical"
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

const SectionBackgroundNode = ({ data }: NodeProps<SectionBackgroundNodeType>) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 border-green-300 text-green-800"
      case "warning":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "critical":
        return "bg-red-100 border-red-300 text-red-800"
      default:
        return "bg-blue-100 border-blue-300 text-blue-800"
    }
  }

  const getStatusDot = (status?: string) => {
    switch (status) {
      case "good":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div
      className={`h-full w-full rounded-lg bg-white shadow-xl transition-all duration-200 border-2 border-gray-200 ${
        data.isDimmed ? "opacity-60" : ""
      }`}
    >
      <div className="relative">
        {/* Main header bar with gradient background for better visual separation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 leading-tight">{data.title}</h2>
              {data.averageTime && (
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${getStatusColor(data.status)}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(data.status)}`} />
                    <span className="text-sm font-semibold">Avg: {data.averageTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Performance indicator icon */}
            {data.status && (
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${getStatusDot(data.status)} shadow-sm`} />
              </div>
            )}
          </div>
        </div>

        {/* Subtle shadow line for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-30" />
      </div>
    </div>
  )
}

export default SectionBackgroundNode
