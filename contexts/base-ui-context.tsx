"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"

// Base UI state interface
export interface BaseUIContextValue {
  // Table/Modal state
  showTableView: boolean
  selectedId: string | null
  isTableLoading: boolean

  // UI operations
  showTable: (id: string) => void
  hideTable: () => void

  // Selection state
  selectedItems: Set<string>
  selectItem: (id: string) => void
  deselectItem: (id: string) => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
}

// Base UI context factory
export function createBaseUIContext() {
  const Context = createContext<BaseUIContextValue | null>(null)

  return {
    Context,
    useContext: () => {
      const ctx = useContext(Context)
      if (!ctx) {
        throw new Error("useBaseUIContext must be used within a BaseUIProvider")
      }
      return ctx
    },
  }
}

// Base UI provider props
export interface BaseUIProviderProps {
  children: React.ReactNode
  onTableShow?: (id: string) => void
  onTableHide?: () => void
}

// Generic base UI provider factory
export function createBaseUIProvider(Context: React.Context<BaseUIContextValue | null>) {
  return function BaseUIProvider({ children, onTableShow, onTableHide }: BaseUIProviderProps) {
    const [showTableView, setShowTableView] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isTableLoading, setIsTableLoading] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    const showTable = useCallback(
      (id: string) => {
        setIsTableLoading(true)
        setSelectedId(id)

        // Custom callback
        onTableShow?.(id)

        // Smooth transition
        requestAnimationFrame(() => {
          setShowTableView(true)
          setTimeout(() => {
            setIsTableLoading(false)
          }, 100)
        })
      },
      [onTableShow],
    )

    const hideTable = useCallback(() => {
      setIsTableLoading(false)
      setShowTableView(false)
      setSelectedId(null)

      // Custom callback
      onTableHide?.()
    }, [onTableHide])

    const selectItem = useCallback((id: string) => {
      setSelectedItems((prev) => new Set(prev).add(id))
    }, [])

    const deselectItem = useCallback((id: string) => {
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, [])

    const clearSelection = useCallback(() => {
      setSelectedItems(new Set())
    }, [])

    const toggleSelection = useCallback((id: string) => {
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    }, [])

    const value = useMemo<BaseUIContextValue>(
      () => ({
        showTableView,
        selectedId,
        isTableLoading,
        showTable,
        hideTable,
        selectedItems,
        selectItem,
        deselectItem,
        clearSelection,
        toggleSelection,
      }),
      [
        showTableView,
        selectedId,
        isTableLoading,
        showTable,
        hideTable,
        selectedItems,
        selectItem,
        deselectItem,
        clearSelection,
        toggleSelection,
      ],
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
  }
}
