"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Clock, User, Edit, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { useChangeTracking, type ChangeRecord } from "../hooks/use-change-tracking"
import { formatDistanceToNow } from "date-fns"

interface ChangeHistoryPanelProps {
  entityId?: string
  entityName?: string
  className?: string
}

export function ChangeHistoryPanel({ entityId, entityName, className }: ChangeHistoryPanelProps) {
  const { changes, getEntityHistory, getRecentChanges, clearHistory } = useChangeTracking()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayChanges = entityId ? getEntityHistory(entityId) : getRecentChanges(20)

  const getChangeIcon = (changeType: ChangeRecord["changeType"]) => {
    switch (changeType) {
      case "created":
        return <Plus className="h-3 w-3 text-green-600" />
      case "updated":
        return <Edit className="h-3 w-3 text-blue-600" />
      case "deleted":
        return <Trash2 className="h-3 w-3 text-red-600" />
      default:
        return <Edit className="h-3 w-3 text-gray-600" />
    }
  }

  const getChangeColor = (changeType: ChangeRecord["changeType"]) => {
    switch (changeType) {
      case "created":
        return "bg-green-50 border-green-200"
      case "updated":
        return "bg-blue-50 border-blue-200"
      case "deleted":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatChangeDetails = (changes: Record<string, { from: any; to: any }>) => {
    return Object.entries(changes).map(([field, change]) => (
      <div key={field} className="text-xs text-gray-600 mt-1">
        <span className="font-medium capitalize">{field}:</span>{" "}
        <span className="line-through text-red-500">{String(change.from)}</span> →{" "}
        <span className="text-green-600">{String(change.to)}</span>
      </div>
    ))
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {entityId ? `Change History - ${entityName}` : "Recent Changes"}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
              {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            {!entityId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {displayChanges.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">No changes recorded yet</div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {displayChanges.map((change, index) => (
                  <div key={change.id}>
                    <div className={`p-3 rounded-lg border ${getChangeColor(change.changeType)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getChangeIcon(change.changeType)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">{change.entityName}</span>
                              <Badge variant="outline" className="text-xs">
                                {change.entityType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{change.userName}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}</span>
                            </div>
                            {Object.keys(change.changes).length > 0 && (
                              <div className="mt-2">{formatChangeDetails(change.changes)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < displayChanges.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  )
}
