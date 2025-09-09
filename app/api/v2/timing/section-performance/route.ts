import { type NextRequest, NextResponse } from "next/server"

// This would typically aggregate data from your Splunk backend
// For now, we'll simulate real-time calculation based on transaction data
const calculateSectionTiming = async () => {
  // In a real implementation, this would query your Splunk backend
  // and aggregate ELAPSED_TIME_SECONDS by section/AIT_NAME

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Calculate dynamic timing based on current system load
  const baseTime = Date.now()
  const loadFactor = (baseTime % 10000) / 10000 // Simulate varying load

  return {
    sections: [
      {
        id: "bg-origination",
        title: "Origination",
        averageTime: Math.round(2 + loadFactor * 2), // 2-4 seconds
        status: loadFactor < 0.3 ? "good" : loadFactor < 0.7 ? "warning" : "critical",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "bg-validation",
        title: "Payment Validation and Routing",
        averageTime: Math.round(1 + loadFactor * 4), // 1-5 seconds
        status: loadFactor < 0.4 ? "good" : loadFactor < 0.8 ? "warning" : "critical",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "bg-middleware",
        title: "Middleware",
        averageTime: Math.round(25 + loadFactor * 10), // 25-35 hours (converted to seconds: 90000-126000)
        status: "critical", // Always critical due to high processing time
        lastUpdated: new Date().toISOString(),
        unit: "hours",
      },
      {
        id: "bg-processing",
        title: "Payment Processing, Sanctions & Investigation",
        averageTime: Math.round(180 + loadFactor * 40), // 180-220 seconds
        status: loadFactor < 0.2 ? "good" : loadFactor < 0.6 ? "warning" : "critical",
        lastUpdated: new Date().toISOString(),
      },
    ],
    totalAverageTime: Math.round(8 + loadFactor * 4), // 8-12 seconds total
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Section performance API called")

    const timingData = await calculateSectionTiming()

    console.log("[v0] Returning dynamic timing data:", timingData)
    return NextResponse.json(timingData)
  } catch (error) {
    console.error("[v0] Error fetching section performance:", error)
    return NextResponse.json({ error: "Failed to fetch section performance data" }, { status: 500 })
  }
}
