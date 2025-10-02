import type { NodeProps, Node } from "@xyflow/react"

type SectionBackgroundNodeData = {
  title: string
  color?: string
  isDimmed?: boolean
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

const SectionBackgroundNode = ({ data }: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div
      className={`h-full w-full rounded-lg bg-white shadow-xl border-2 border-gray-200 transition-all duration-200 ${
        data.isDimmed ? "opacity-60" : ""
      }`}
    >
      <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-base font-bold text-gray-800">{data.title}</h2>
      </div>
    </div>
  )
}

export default SectionBackgroundNode
