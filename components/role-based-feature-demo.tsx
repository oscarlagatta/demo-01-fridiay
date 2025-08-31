"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { useAuthzRules } from "../hooks/use-authz-rules"
import { useAuth } from "../contexts/auth-context"
import { AlertCircle, CheckCircle, Lock, Unlock } from "lucide-react"

export function RoleBasedFeatureDemo() {
  const { canDisplayFeature, canEditFeature } = useAuthzRules()
  const { userDetails } = useAuth()
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false)

  const handleSearch = () => {
    setHasPerformedSearch(true)
  }

  const renderButtons = () => {
    if (!canDisplayFeature()) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 mb-3">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Access Mode</span>
          </div>
          {hasPerformedSearch ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Summary
              </Button>
              <Button size="sm" variant="outline">
                Details
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Perform a search to enable available actions</p>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600 mb-3">
          <Unlock className="h-4 w-4" />
          <span className="text-sm font-medium">Full Access Mode</span>
        </div>
        {hasPerformedSearch ? (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline">
              Summary
            </Button>
            <Button size="sm" variant="outline">
              Details
            </Button>
            <Button size="sm" variant="outline">
              Flow
            </Button>
            <Button size="sm" variant="outline">
              Trend
            </Button>
            <Button size="sm" variant="outline">
              Balanced
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Perform a search to enable all available actions</p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Role-Based Feature Access Demo
          {canDisplayFeature() ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
        </CardTitle>
        <CardDescription>Demonstrates how features are controlled based on user roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Current User:</h4>
          <div className="space-y-1">
            <p className="text-sm">Username: {userDetails?.username || "Not logged in"}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Roles:</span>
              {userDetails?.roleNames ? (
                userDetails.roleNames.split(",").map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role.trim()}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">
                  No roles
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Search Simulation */}
        <div className="space-y-2">
          <Button onClick={handleSearch} disabled={hasPerformedSearch} className="w-full">
            {hasPerformedSearch ? "Search Completed" : "Perform Search"}
          </Button>
        </div>

        {/* Feature Buttons */}
        {renderButtons()}

        {/* Access Status */}
        <div className="p-3 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Access Status:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Can Display Features:</span>
              <Badge variant={canDisplayFeature() ? "default" : "secondary"}>
                {canDisplayFeature() ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Can Edit Features:</span>
              <Badge variant={canEditFeature() ? "default" : "secondary"}>{canEditFeature() ? "Yes" : "No"}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Splunk Data Access:</span>
              <Badge variant={canDisplayFeature() ? "default" : "secondary"}>
                {canDisplayFeature() ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
