"use client"

import { useState } from "react"
import { Info, Search } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export function InfoSection() {
  const [activeMode, setActiveMode] = useState<"track" | "observability">("track")

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Information text */}
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              The Total Average Time for transactions in the US is 10 seconds
            </span>
          </div>

          {/* Right side - Search box and toggle buttons */}
          <div className="flex items-center space-x-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="Search..." className="pl-10 w-48 h-8 text-sm" />
            </div>

            {/* Toggle buttons */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <Button
                variant={activeMode === "track" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-3 py-1 text-xs ${
                  activeMode === "track"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveMode("track")}
              >
                Track and Trace
              </Button>
              <Button
                variant={activeMode === "observability" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-3 py-1 text-xs border-l ${
                  activeMode === "observability"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setActiveMode("observability")}
              >
                Observability
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
