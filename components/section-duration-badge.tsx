import { Clock, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionDurationBadgeProps {
  duration?: number
  sectionName: string
  className?: string
  trend?: "up" | "down" | "stable"
  isLoading?: boolean
  hasError?: boolean
  lastUpdated?: Date
}

export default function SectionDurationBadge({
  duration,
  sectionName,
  className,
  trend = "stable",
  isLoading = false,
  hasError = false,
  lastUpdated,
}: SectionDurationBadgeProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium",
          "backdrop-blur-sm shadow-sm bg-gray-50 border-gray-200 text-gray-500",
          className,
        )}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="font-mono">Loading...</span>
      </div>
    )
  }

  if (hasError || duration === undefined) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium",
          "backdrop-blur-sm shadow-sm bg-red-50 border-red-200 text-red-600",
          className,
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="font-mono">Error</span>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`
    }
    return `${seconds.toFixed(1)}s`
  }

  const getDurationColor = (seconds: number) => {
    if (seconds < 1) return "text-green-600 bg-green-50 border-green-200"
    if (seconds < 3) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  const getDataFreshness = () => {
    if (!lastUpdated) return ""
    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) return "Live"
    if (diffSeconds < 300) return `${Math.floor(diffSeconds / 60)}m ago`
    return "Stale"
  }

  const dataFreshness = getDataFreshness()
  const isStale = dataFreshness === "Stale"

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium",
        "backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md",
        getDurationColor(duration),
        isStale && "opacity-70 border-dashed",
        className,
      )}
      title={`${sectionName} - Last updated: ${lastUpdated?.toLocaleTimeString() || "Unknown"}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span className="font-mono">Avg: {formatDuration(duration)}</span>
      <span className="text-xs opacity-70">{getTrendIcon()}</span>
      {dataFreshness && (
        <span
          className={cn(
            "text-xs px-1 rounded",
            dataFreshness === "Live"
              ? "bg-green-100 text-green-700"
              : isStale
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700",
          )}
        >
          {dataFreshness}
        </span>
      )}
    </div>
  )
}

export { SectionDurationBadge }
