import type { NodeProps, Node } from "@xyflow/react"
import SectionDurationBadge from "./section-duration-badge"

type SectionBackgroundNodeData = {
  title: string
  color: string
  isDimmed?: boolean
  duration?: number
  trend?: "up" | "down" | "stable"
  region?: "US" | "India" | "APAC"
  phaseTitle?: string
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

const SectionBackgroundNode = ({ data }: NodeProps<SectionBackgroundNodeType>) => {
  const usPhaseHeaders: Record<string, string> = {
    Origination: "Client Connectivity",
    "Validation & Routing": "Payment Initiation",
    Middleware: "Payment Processing",
    "Processing & Investigation": "Clearing & Settlement",
  }

  const showUSHeader = data.region === "US"
  const phaseTitle = data.phaseTitle || usPhaseHeaders[data.title] || data.title

  if (showUSHeader) {
    return (
      <div className={`h-full w-full transition-all duration-200 ${data.isDimmed ? "opacity-60" : ""}`}>
        <div className="relative w-full h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Chevron shape using CSS clip-path */}
            <div
              className="relative h-full w-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%, 24px 50%)",
              }}
            >
              {/* White border effect */}
              <div
                className="absolute inset-0"
                style={{
                  background: "white",
                  clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%, 24px 50%)",
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center m-[2px]"
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                    clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 0 100%, 24px 50%)",
                  }}
                >
                  <span className="px-4 sm:px-8 text-center font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                    {phaseTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-full w-full rounded-lg bg-white shadow-xl transition-all duration-200 ${
        data.isDimmed ? "opacity-60" : ""
      }`}
    >
      <div className="p-4">
        {data.duration && (
          <div className="mb-3 flex justify-center">
            <SectionDurationBadge
              duration={data.duration}
              sectionName={data.title}
              trend={data.trend || "stable"}
              className="shadow-sm"
            />
          </div>
        )}
        <h2 className="text-lg font-bold text-gray-700 text-center">{data.title}</h2>
      </div>
    </div>
  )
}

export default SectionBackgroundNode
