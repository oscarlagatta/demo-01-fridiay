import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API call to your backend service
    // Replace this with actual API integration
    const response = await fetch(`${process.env.BACKEND_API_URL}/section-durations`, {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      sections: data.sections,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Section durations API error:", error)
    return NextResponse.json({ error: "Failed to fetch section durations" }, { status: 500 })
  }
}
