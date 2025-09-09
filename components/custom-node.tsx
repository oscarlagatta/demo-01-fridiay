"use client"

import { memo, useMemo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { useGetSplunk } from "../hooks/use-get-splunk"
import { computeTrendColors, getTrendColorClass, type TrendColor } from "../lib/trend-color-utils"
import {
  computeTrafficStatusColors,
  getTrafficStatusColorClass,
  type TrafficStatusColor,
} from "../lib/traffic-status-utils"
import { CardLoadingSkeleton } from "./loading-skeleton"
import { useTransactionSearchContext } from "./transaction-search-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

type CustomNodeData = {
  title: string
  subtext: string
  size: "small" | "medium" | "large"
  isSelected?: boolean
  isConnected?: boolean
  isDimmed?: boolean
  onClick?: (nodeId: string) => void
}

type CustomNodeType = Node<CustomNodeData>

const CustomNode = ({ data, id }: NodeProps<CustomNodeType>) => {
  const { data: splunkData, isLoading, isError, isFetching } = useGetSplunk()
  const {
    active: txActive,
    isFetching: txFetching,
    matchedAitIds,
    showTable,
    isTableLoading,
  } = useTransactionSearchContext()

  // Extract AIT number from the node data subtext (format: "AIT {number}")
  const aitNum = useMemo(() => {
    const match = data.subtext.match(/AIT (\d+)/)
    return match ? match[1] : null
  }, [data.subtext, id])

  // Compute trend colors from Splunk data
  const trendColorMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrendColors(splunkData)
  }, [splunkData])

  // Compute traffic status colors from Splunk data
  const trafficStatusMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrafficStatusColors(splunkData)
  }, [splunkData])

  // Get the trend color for this specific node
  const trendColor: TrendColor = aitNum && trendColorMapping[aitNum] ? trendColorMapping[aitNum] : "grey"

  // Get the traffic status color for this specific node
  const trafficStatusColor: TrafficStatusColor =
    aitNum && trafficStatusMapping[aitNum] ? trafficStatusMapping[aitNum] : "grey"

  const trendColorClass = getTrendColorClass(trendColor)
  const trafficStatusColorClass = getTrafficStatusColorClass(trafficStatusColor)

  const handleClick = () => {
    if (data.onClick && id && !isLoading) {
      data.onClick(id)
    }
  }

  const mockTooltipData = {
    avg: "2.3s",
    p95: "4.1s",
    lastUpdated: new Date().toLocaleString(),
  }

  // Determine styling based on selection state and loading
  const getCardClassName = () => {
    let baseClass =
      "w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56 border-2 border-[rgb(10,49,97)] shadow-md cursor-pointer transition-all duration-200"

    // Loading state styling
    if (isLoading || isFetching) {
      baseClass += " bg-gray-50"
    } else if (isError) {
      baseClass += " bg-red-50 border-red-200"
    } else {
      baseClass += " bg-gray-100"
    }

    if (data.isSelected && !isLoading) {
      baseClass += " ring-2 ring-blue-700 shadow-lg scale-105"
    } else if (data.isConnected && !isLoading) {
      baseClass += " ring-2 ring-blue-300 shadow-lg"
    } else if (data.isDimmed) {
      baseClass += " opacity-40"
    }

    return baseClass
  }

  // Show loading skeleton during initial load of Splunk (baseline) data
  if (isLoading) {
    return (
      <CardLoadingSkeleton className="w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56" />
    )
  }

  const getDotColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-500"
      case "yellow":
        return "bg-yellow-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={getCardClassName()} onClick={handleClick} data-testid={`custom-node-${id}`}>
            <Handle type="target" position={Position.Left} className="!bg-gray-400 w-2 h-2" />
            <Handle type="source" position={Position.Right} className="!bg-gray-400 w-2 h-2" />
            <Handle type="source" position={Position.Top} className="!bg-gray-400 w-2 h-2" />
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 w-2 h-2" />
            <CardHeader className="p-2">
              <CardTitle className="text-xs font-bold whitespace-nowrap text-center truncate">{data.title}</CardTitle>
              <p className="text-[10px] text-muted-foreground text-center truncate" data-testid="node-subtext">
                {data.subtext}
              </p>
            </CardHeader>
            <CardContent className="p-2 pt-0 relative">
              <div className="absolute bottom-1 right-1 flex gap-1">
                <div
                  className={`w-3 h-3 rounded-full ${getDotColor(trafficStatusColor)} border border-white shadow-sm`}
                />
                <div className={`w-3 h-3 rounded-full ${getDotColor(trendColor)} border border-white shadow-sm`} />
                <div className={`w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm`} />
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg">
          <div className="space-y-1">
            <div>
              <strong>Name:</strong> {data.title}
            </div>
            <div>
              <strong>AIT ID:</strong> {data.subtext}
            </div>
            <div>
              <strong>Avg:</strong> {mockTooltipData.avg}
            </div>
            <div>
              <strong>P95:</strong> {mockTooltipData.p95}
            </div>
            <div>
              <strong>Last Updated:</strong> {mockTooltipData.lastUpdated}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default memo(CustomNode)
