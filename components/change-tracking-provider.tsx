"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useChangeTracking } from "../hooks/use-change-tracking"

const ChangeTrackingContext = createContext<ReturnType<typeof useChangeTracking> | null>(null)

export function ChangeTrackingProvider({ children }: { children: ReactNode }) {
  const changeTracking = useChangeTracking()

  return <ChangeTrackingContext.Provider value={changeTracking}>{children}</ChangeTrackingContext.Provider>
}

export function useChangeTrackingContext() {
  const context = useContext(ChangeTrackingContext)
  if (!context) {
    throw new Error("useChangeTrackingContext must be used within a ChangeTrackingProvider")
  }
  return context
}
