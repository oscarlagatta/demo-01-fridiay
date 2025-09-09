"use client"

import { useQuery } from "@tanstack/react-query"

export interface SectionTiming {
  id: string
  title: string
  averageTime: number
  status: "good" | "warning" | "critical"
  lastUpdated: string
  unit?: "seconds" | "hours"
}

export interface SectionTimingResponse {
  sections: SectionTiming[]
  totalAverageTime: number
  lastUpdated: string
}

export function useSectionTiming(refreshInterval = 30000) {
  return useQuery({
    queryKey: ["section-timing"],
    queryFn: async (): Promise<SectionTimingResponse> => {
      console.log("[v0] Fetching section timing data")

      const response = await fetch("/api/v2/timing/section-performance")

      if (!response.ok) {
        throw new Error(`Failed to fetch section timing: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Section timing data received:", data)
      return data
    },
    refetchInterval: refreshInterval, // Refresh every 30 seconds by default
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}
