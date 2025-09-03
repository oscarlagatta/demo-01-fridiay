"use client"

import { useState, useCallback, useEffect } from "react"

export interface ChangeRecord {
  id: string
  entityType: "node" | "edge"
  entityId: string
  entityName: string
  changeType: "created" | "updated" | "deleted"
  changes: Record<string, { from: any; to: any }>
  timestamp: string
  userId: string
  userName: string
}

interface ChangeTrackingState {
  changes: ChangeRecord[]
  isLoading: boolean
}

export function useChangeTracking() {
  const [state, setState] = useState<ChangeTrackingState>({
    changes: [],
    isLoading: false,
  })

  // Load changes from localStorage on mount
  useEffect(() => {
    const savedChanges = localStorage.getItem("flow-diagram-changes")
    if (savedChanges) {
      try {
        const parsedChanges = JSON.parse(savedChanges)
        setState((prev) => ({ ...prev, changes: parsedChanges }))
      } catch (error) {
        console.error("Failed to load change history:", error)
      }
    }
  }, [])

  // Save changes to localStorage whenever changes update
  const saveChanges = useCallback((changes: ChangeRecord[]) => {
    try {
      localStorage.setItem("flow-diagram-changes", JSON.stringify(changes))
    } catch (error) {
      console.error("Failed to save change history:", error)
    }
  }, [])

  const trackChange = useCallback(
    (
      entityType: "node" | "edge",
      entityId: string,
      entityName: string,
      changeType: "created" | "updated" | "deleted",
      changes: Record<string, { from: any; to: any }> = {},
    ) => {
      const changeRecord: ChangeRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entityType,
        entityId,
        entityName,
        changeType,
        changes,
        timestamp: new Date().toISOString(),
        userId: "current-user", // In a real app, this would come from auth context
        userName: "Current User",
      }

      setState((prev) => {
        const newChanges = [changeRecord, ...prev.changes].slice(0, 100) // Keep last 100 changes
        saveChanges(newChanges)
        return { ...prev, changes: newChanges }
      })

      return changeRecord
    },
    [saveChanges],
  )

  const getEntityHistory = useCallback(
    (entityId: string) => {
      return state.changes
        .filter((change) => change.entityId === entityId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    [state.changes],
  )

  const getRecentChanges = useCallback(
    (limit = 10) => {
      return state.changes.slice(0, limit)
    },
    [state.changes],
  )

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, changes: [] }))
    localStorage.removeItem("flow-diagram-changes")
  }, [])

  const getLastModified = useCallback(
    (entityId: string) => {
      const entityChanges = getEntityHistory(entityId)
      return entityChanges.length > 0
        ? {
            timestamp: entityChanges[0].timestamp,
            userName: entityChanges[0].userName,
            changeType: entityChanges[0].changeType,
          }
        : null
    },
    [getEntityHistory],
  )

  return {
    changes: state.changes,
    isLoading: state.isLoading,
    trackChange,
    getEntityHistory,
    getRecentChanges,
    getLastModified,
    clearHistory,
  }
}
