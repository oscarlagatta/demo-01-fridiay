"use client"

import type React from "react"

import { memo, useMemo, useState } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { useGetSplunk } from "../hooks/use-get-splunk"
import { computeTrendColors, getTrendColorClass, type TrendColor } from "../lib/trend-color-utils"
import {
  computeTrafficStatusColors,
  getTrafficStatusColorClass,
  type TrafficStatusColor,
} from "../lib/traffic-status-utils"
import { LoadingButton } from "./loading-button"
import { CardLoadingSkeleton } from "./loading-skeleton"
import { useTransactionSearchContext } from "./transaction-search-provider"

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

  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  const handleDetailsClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent node selection
    if (aitNum && !isDetailsLoading) {
      setIsDetailsLoading(true)
      try {
        await showTable(aitNum)
      } finally {
        setTimeout(() => {
          setIsDetailsLoading(false)
        }, 500)
      }
    }
  }

  // Determine styling based on selection state and loading
  const getCardClassName = () => {
    let baseClass =
      "w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56 border border-white/30 shadow-xl backdrop-blur-md cursor-pointer transition-all duration-300 rounded-xl"

    // Loading state styling with glassmorphism
    if (isLoading || isFetching) {
      baseClass += " bg-white/10 backdrop-blur-sm"
    } else if (isError) {
      baseClass += " bg-red-500/10 border-red-300/30 backdrop-blur-md"
    } else {
      baseClass += " bg-white/15 backdrop-blur-md"
    }

    if (data.isSelected && !isLoading) {
      baseClass += " ring-2 ring-blue-400/50 shadow-2xl scale-105 bg-white/25"
    } else if (data.isConnected && !isLoading) {
      baseClass += " ring-2 ring-blue-300/40 shadow-xl bg-white/20"
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

  // Three-phase UI logic for buttons:
  // 1) Default mode (no txActive): show Flow/Trend/Balanced
  // 2) Loading mode (txActive && txFetching): show Summary/Details (loading) on all nodes to indicate a fetch is happening
  // 3) Results mode (txActive && !txFetching): show Summary/Details only on AITs present in matchedAitIds, show NO buttons otherwise
  const inDefaultMode = !txActive
  const inLoadingMode = txActive && txFetching
  const inResultsMode = txActive && !txFetching
  const isMatched = !!aitNum && matchedAitIds.has(aitNum)

  return (
    <Card className={getCardClassName()} onClick={handleClick} data-testid={`custom-node-${id}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white/60 !backdrop-blur-sm !border !border-white/30 w-2 h-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white/60 !backdrop-blur-sm !border !border-white/30 w-2 h-2"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-white/60 !backdrop-blur-sm !border !border-white/30 w-2 h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white/60 !backdrop-blur-sm !border !border-white/30 w-2 h-2"
      />
      <CardHeader className="p-2">
        <CardTitle className="text-xs font-bold whitespace-nowrap text-center truncate text-gray-800 drop-shadow-sm">
          {data.title}
        </CardTitle>
        <p className="text-[10px] text-gray-600 text-center truncate drop-shadow-sm" data-testid="node-subtext">
          {data.subtext}
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex flex-wrap justify-center gap-1 transition-all duration-200">
          {inDefaultMode && (
            <>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white flex-1 min-w-0 backdrop-blur-sm border-white/20 ${
                  isError ? "bg-gray-400/80" : trafficStatusColorClass
                }`}
              >
                Flow
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white flex-1 min-w-0 backdrop-blur-sm border-white/20 ${isError ? "bg-gray-400/80" : trendColorClass}`}
              >
                Trend
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-white/20 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/30 flex-1 min-w-0"
              >
                Balanced
              </LoadingButton>
            </>
          )}

          {inLoadingMode && (
            <>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-blue-600/80 backdrop-blur-sm text-white hover:bg-blue-700/80 hover:text-white border-blue-400/30 flex-1 min-w-0"
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-blue-600/80 backdrop-blur-sm text-white hover:bg-blue-700/80 hover:text-white border-blue-400/30 flex-1 min-w-0"
              >
                Details
              </LoadingButton>
            </>
          )}

          {inResultsMode && (
            <>
              <LoadingButton
                isLoading={false}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 backdrop-blur-sm ${
                  isMatched
                    ? "bg-blue-600/80 text-white hover:bg-blue-700/80 hover:text-white border-blue-400/30"
                    : "bg-gray-300/60 text-gray-500 border-gray-400/30 cursor-not-allowed backdrop-blur-sm"
                }`}
                disabled={!isMatched}
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={isMatched && isDetailsLoading}
                loadingText="Loading..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 backdrop-blur-sm ${
                  isMatched
                    ? "bg-blue-600/80 text-white hover:bg-blue-700/80 hover:text-white border-blue-400/30"
                    : "bg-gray-300/60 text-gray-500 border-gray-400/30 cursor-not-allowed backdrop-blur-sm"
                }`}
                onClick={isMatched ? handleDetailsClick : undefined}
                disabled={!isMatched || isDetailsLoading}
              >
                Details
              </LoadingButton>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
