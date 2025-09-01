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
      "w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56 border-2 shadow-lg cursor-pointer transition-all duration-300 ease-out"

    if (isLoading || isFetching) {
      baseClass += " bg-gradient-to-br from-muted to-muted/50 border-border shimmer"
    } else if (isError) {
      baseClass += " bg-gradient-to-br from-red-50 to-red-100 border-red-300"
    } else {
      baseClass += " bg-gradient-to-br from-card to-card/80 border-primary/20"
    }

    if (data.isSelected && !isLoading) {
      baseClass += " ring-4 ring-primary/50 shadow-2xl scale-105 selected border-primary"
    } else if (data.isConnected && !isLoading) {
      baseClass += " ring-3 ring-accent/40 shadow-xl border-accent/50"
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
      <Handle type="target" position={Position.Left} className="!bg-primary w-3 h-3 border-2 border-white shadow-md" />
      <Handle type="source" position={Position.Right} className="!bg-primary w-3 h-3 border-2 border-white shadow-md" />
      <Handle type="source" position={Position.Top} className="!bg-primary w-3 h-3 border-2 border-white shadow-md" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary w-3 h-3 border-2 border-white shadow-md"
      />

      <CardHeader className="p-3 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-sm font-bold whitespace-nowrap text-center truncate text-primary">
          {data.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground text-center truncate" data-testid="node-subtext">
          {data.subtext}
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="flex flex-wrap justify-center gap-2 transition-all duration-300">
          {inDefaultMode && (
            <>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`node-button h-7 px-3 text-xs font-medium shadow-md text-white flex-1 min-w-0 border-0 ${
                  isError ? "bg-gray-400" : trafficStatusColorClass
                }`}
              >
                Flow
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`node-button h-7 px-3 text-xs font-medium shadow-md text-white flex-1 min-w-0 border-0 ${isError ? "bg-gray-400" : trendColorClass}`}
              >
                Trend
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className="node-button h-7 px-3 text-xs font-medium shadow-md bg-gradient-to-r from-accent/80 to-primary/80 text-white border-0 flex-1 min-w-0"
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
                className="node-button h-7 px-3 text-xs font-medium shadow-md bg-gradient-to-r from-primary to-accent text-white border-0 flex-1 min-w-0"
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className="node-button h-7 px-3 text-xs font-medium shadow-md bg-gradient-to-r from-primary to-accent text-white border-0 flex-1 min-w-0"
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
                className={`node-button h-7 px-3 text-xs font-medium shadow-md flex-1 min-w-0 border-0 ${
                  isMatched
                    ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isMatched}
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={isMatched && isDetailsLoading}
                loadingText="Loading..."
                variant="outline"
                className={`node-button h-7 px-3 text-xs font-medium shadow-md flex-1 min-w-0 border-0 ${
                  isMatched
                    ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
