"use client"

import { useEffect, useRef, useState } from "react"

interface PerformanceMetrics {
  renderTime: number
  apiCallTime: number
  memoryUsage: number
  contextSwitchTime: number
}

export const usePerformanceMonitor = (contextName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    apiCallTime: 0,
    memoryUsage: 0,
    contextSwitchTime: 0,
  })

  const renderStartTime = useRef<number>(0)
  const apiStartTime = useRef<number>(0)

  // Monitor render performance
  useEffect(() => {
    renderStartTime.current = performance.now()

    return () => {
      const renderTime = performance.now() - renderStartTime.current
      setMetrics((prev) => ({ ...prev, renderTime }))

      // Log performance metrics in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[v0] ${contextName} render time:`, renderTime, "ms")
      }
    }
  })

  // Monitor API call performance
  const trackApiCall = (apiCallFn: () => Promise<any>) => {
    return async () => {
      apiStartTime.current = performance.now()

      try {
        const result = await apiCallFn()
        const apiCallTime = performance.now() - apiStartTime.current

        setMetrics((prev) => ({ ...prev, apiCallTime }))

        if (process.env.NODE_ENV === "development") {
          console.log(`[v0] ${contextName} API call time:`, apiCallTime, "ms")
        }

        return result
      } catch (error) {
        const apiCallTime = performance.now() - apiStartTime.current
        setMetrics((prev) => ({ ...prev, apiCallTime }))
        throw error
      }
    }
  }

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ("memory" in performance) {
        const memoryInfo = (performance as any).memory
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memoryInfo.usedJSHeapSize,
        }))
      }
    }

    const intervalId = setInterval(updateMemoryUsage, 5000)
    return () => clearInterval(intervalId)
  }, [])

  return { metrics, trackApiCall }
}
