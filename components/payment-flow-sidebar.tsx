"use client"

import type React from "react"

import { useState } from "react"
import {
  Heart,
  ArrowLeftToLine,
  ArrowRightToLine,
  Zap,
  CreditCard,
  Building,
  Globe,
  Home,
  BarChart3,
  Users,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"

const mainPageItems = [
  { id: "home-dashboard", title: "Home Dashboard", subtitle: "Overview and analytics", Icon: Home },
  { id: "analytics", title: "Analytics", subtitle: "Payment insights and reports", Icon: BarChart3 },
  { id: "user-management", title: "User Management", subtitle: "Manage system users", Icon: Users },
  { id: "reports", title: "Reports", subtitle: "Generate and view reports", Icon: FileText },
  { id: "settings", title: "Settings", subtitle: "System configuration", Icon: Settings },
]

const paymentFlowItems = [
  { id: "us-wires", title: "US Wires", subtitle: "US Wire Transfer Flow", Icon: Zap },
  { id: "india", title: "India", subtitle: "India Payment Flow", Icon: Globe },
  { id: "payment-health", title: "Payment Health", subtitle: "Health monitoring", Icon: Heart },
  { id: "international-wires", title: "International Wires", subtitle: "Global wire transfers", Icon: Building },
  { id: "card-payments", title: "Card Payments", subtitle: "Card processing flow", Icon: CreditCard },
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
        "duration-300 flex flex-col border-r border-border transition-all",
        "bg-white",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">Navigation</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 text-muted-foreground hover:bg-accent"
          >
            {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 p-4 space-y-6">
        {!isCollapsed && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">MAIN PAGES</h3>
            <nav className="space-y-1">
              {mainPageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSubItemSelected(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    selectedSubItem === item.id
                      ? "bg-slate-800 text-white shadow-md"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  <item.Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">FLOW DIAGRAMS</h3>
          )}
          <nav className="space-y-1">
            {paymentFlowItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSubItemSelected(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                  selectedSubItem === item.id ? "bg-slate-800 text-white shadow-md" : "text-foreground hover:bg-accent",
                  isCollapsed && "justify-center py-2",
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.subtitle}</div>
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export function PaymentFlowLayout({ children }: { children: React.ReactNode }) {
  const [selectedMainItem] = useState("e2e-monitor")
  const [selectedSubItem, setSelectedSubItem] = useState("us-wires") // Set us-wires as default
  const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (selectedSubItem) {
      case "us-wires":
        return <div className="flex-1">{children}</div>
      case "home-dashboard":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Home Dashboard</h1>
            <p className="text-muted-foreground">Overview and analytics dashboard coming soon.</p>
          </div>
        )
      case "analytics":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Analytics</h1>
            <p className="text-muted-foreground">Payment insights and reports coming soon.</p>
          </div>
        )
      case "user-management":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">User Management</h1>
            <p className="text-muted-foreground">User management interface coming soon.</p>
          </div>
        )
      case "reports":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <p className="text-muted-foreground">Report generation interface coming soon.</p>
          </div>
        )
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground">System configuration interface coming soon.</p>
          </div>
        )
      case "india":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">India Payment Flow</h1>
            <p className="text-muted-foreground">India payment flow monitoring coming soon.</p>
          </div>
        )
      case "payment-health":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Payment Health Dashboard</h1>
            <p className="text-muted-foreground">Payment health monitoring content coming soon.</p>
          </div>
        )
      case "international-wires":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">International Wires</h1>
            <p className="text-muted-foreground">International wire transfer monitoring content coming soon.</p>
          </div>
        )
      case "card-payments":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Card Payments</h1>
            <p className="text-muted-foreground">Card payment monitoring content coming soon.</p>
          </div>
        )
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
        <main className="bg-background flex flex-1 flex-col">{renderContent()}</main>
      </div>
    </TransactionSearchProvider>
  )
}
