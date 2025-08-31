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
import { useAuthzRules } from "../hooks/use-authz-rules"

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
  const { hasRequiredRole } = useAuthzRules()
  const isAuthorized = hasRequiredRole()

  const {
    data: splunkData,
    isLoading,
    isError,
    isFetching,
  } = useGetSplunk({
    enabled: isAuthorized,
  })
  const {
    active: txActive,
    isFetching: txFetching,
    matchedAitIds,
    showTable,
    isTableLoading,
  } = useTransactionSearchContext()

  const aitNum = useMemo(() => {
    const match = data.subtext.match(/AIT (\d+)/)
    return match ? match[1] : null
  }, [data.subtext, id])

  const trendColorMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrendColors(splunkData)
  }, [splunkData])

  const trafficStatusMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrafficStatusColors(splunkData)
  }, [splunkData])

  const trendColor: TrendColor = aitNum && trendColorMapping[aitNum] ? trendColorMapping[aitNum] : "grey"
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
    e.stopPropagation()
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

  const getCardClassName = () => {
    let baseClass =
      "w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56 border-2 border-[rgb(10,49,97)] shadow-md cursor-pointer transition-all duration-200"

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

  if (isLoading) {
    return (
      <CardLoadingSkeleton className="w-48 min-w-48 max-w-48 sm:w-52 sm:min-w-52 sm:max-w-52 md:w-56 md:min-w-56 md:max-w-56" />
    )
  }

  const inDefaultMode = !txActive
  const inLoadingMode = txActive && txFetching
  const inResultsMode = txActive && !txFetching
  const isMatched = !!aitNum && matchedAitIds.has(aitNum)

  return (
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
      <CardContent className="p-2 pt-0">
        <div className="flex flex-wrap justify-center gap-1 transition-all duration-200">
          {!isAuthorized ? (
            <>
              <LoadingButton
                isLoading={inLoadingMode}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 ${
                  inResultsMode && isMatched
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                    : inResultsMode && !isMatched
                      ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                }`}
                disabled={inResultsMode && !isMatched}
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={inResultsMode && isMatched && isDetailsLoading}
                loadingText="Loading..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 ${
                  inResultsMode && isMatched
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                    : inResultsMode && !isMatched
                      ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                }`}
                onClick={inResultsMode && isMatched ? handleDetailsClick : undefined}
                disabled={(inResultsMode && !isMatched) || isDetailsLoading}
              >
                Details
              </LoadingButton>
            </>
          ) : (
            <>
              {inDefaultMode && (
                <>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className={`h-6 px-2 text-[10px] shadow-sm text-white flex-1 min-w-0 ${
                      isError ? "bg-gray-400" : trafficStatusColorClass
                    }`}
                  >
                    Flow
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className={`h-6 px-2 text-[10px] shadow-sm text-white flex-1 min-w-0 ${isError ? "bg-gray-400" : trendColorClass}`}
                  >
                    Trend
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isFetching}
                    loadingText="..."
                    variant="outline"
                    className="h-6 px-2 text-[10px] shadow-sm bg-transparent flex-1 min-w-0"
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
                    className="h-6 px-2 text-[10px] shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600 flex-1 min-w-0"
                  >
                    Summary
                  </LoadingButton>
                  <LoadingButton
                    isLoading={true}
                    loadingText="..."
                    variant="outline"
                    className="h-6 px-2 text-[10px] shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600 flex-1 min-w-0"
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
                    className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 ${
                      isMatched
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                        : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!isMatched}
                  >
                    Summary
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isMatched && isDetailsLoading}
                    loadingText="Loading..."
                    variant="outline"
                    className={`h-6 px-2 text-[10px] shadow-sm flex-1 min-w-0 ${
                      isMatched
                        ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                        : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                    }`}
                    onClick={isMatched ? handleDetailsClick : undefined}
                    disabled={!isMatched || isDetailsLoading}
                  >
                    Details
                  </LoadingButton>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
