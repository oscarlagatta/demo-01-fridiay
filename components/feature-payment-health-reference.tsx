"use client"

import { useState } from "react"

import { Heart, ArrowLeftToLine, ArrowRightToLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"

const e2eSubMenuItems = [
  { id: "payment-health", title: "Payment Health", Icon: Heart },
  { id: "us-wires", title: "U.S Wires", Icon: Heart },
]

type SecondaryBarProps = {
  selectedSubItem: string
  onSubItemSelected: (id: string) => void
  isVisible: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function SecondarySideBar({
  selectedSubItem,
  onSubItemSelected,
  isVisible,
  isCollapsed,
  onToggleCollapse,
}: SecondaryBarProps) {
  if (!isVisible) {
    return null
  }
  return (
    <div
      className={cn(
        "duration-50 flex flex-col border-r border-slate-200 bg-white transition-all",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-lg font-semibold text-slate-800">E2e Payment Monitoring</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 text-slate-600 hover:bg-slate-200"
          >
            {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {e2eSubMenuItems.map((item) => {
            ;<button
              key={item.id}
              onClick={() => onSubItemSelected(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                selectedSubItem === item.id ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200",
                isCollapsed && "justify-center",
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </button>
          })}
        </nav>
      </div>
    </div>
  )
}

export function FeaturePaymentHealth() {
  const [selectedMainItem] = useState("e2e-monitor")
  const [selectedSubItem, setSelectedSubItem] = useState("payment-health")

  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (selectedSubItem) {
      case "payment-health":
        return <div>Payment Health</div>
      default:
        return (
          <div className="p-6">
            <p className="text-muted-foreground">Content for this section is coming soon.</p>
          </div>
        )
    }
  }

  return (
    <TransactionSearchProvider>
      <div className="flex min-h-screen w-full">
        <div className="flex flex-col">
          <SecondarySideBar
            selectedSubItem={selectedSubItem}
            onSubItemSelected={setSelectedSubItem}
            isVisible={selectedMainItem === "e2e-monitor"}
            isCollapsed={secondarySidebarCollapsed}
            onToggleCollapse={() => setSecondarySidebarCollapsed(!secondarySidebarCollapsed)}
          />
        </div>
        <main className="bg-brackground flex flex-1 flex-col">{renderContent()}</main>
      </div>
    </TransactionSearchProvider>
  )
}
