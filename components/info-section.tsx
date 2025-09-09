"use client"

import { Info } from "lucide-react"
import { Card, CardContent } from "./ui/card"

interface InfoSectionProps {
  time?: number
}

export function InfoSection({ time = 0 }: InfoSectionProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            The Total Average Time for transactions in the US is {time} seconds
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
