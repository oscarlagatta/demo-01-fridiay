"use client"
import { useCallback } from "react"
import useSWR from "swr"

interface SectionDuration {
  sectionId: string
  duration: number
  trend: "up" | "down" | "stable"
  lastUpdated: Date
}

interface SectionDurationsResponse {
  sections: SectionDuration[]
  timestamp: string
}

export function useSectionDurations(refreshInterval = 30000) {
  const fetcher = async (url: string): Promise<SectionDurationsResponse> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  const { data, error, isLoading, mutate } = useSWR("/api/section-durations", fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Prevent duplicate requests within 5s
  })

  const refreshDurations = useCallback(() => {
    mutate()
  }, [mutate])

  // Transform API data into a more usable format
  const sectionDurations = data?.sections.reduce(
    (acc, section) => {
      acc[section.sectionId] = {
        duration: section.duration,
        trend: section.trend,
        lastUpdated: new Date(section.lastUpdated),
      }
      return acc
    },
    {} as Record<string, { duration: number; trend: "up" | "down" | "stable"; lastUpdated: Date }>,
  )

  return {
    sectionDurations: sectionDurations || {},
    isLoading,
    error,
    lastUpdated: data?.timestamp ? new Date(data.timestamp) : null,
    refreshDurations,
  }
}
