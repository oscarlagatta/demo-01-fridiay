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
  ChevronDown,
  ChevronRight,
  Coins,
  Banknote,
  CircleDollarSign,
  Search,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"
import { USWiresToggleContent } from "@/components/us-wires-toggle-content"

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

const apacCountries = [
  { id: "china", title: "China", subtitle: "CNY • Mobile Payments", Icon: CircleDollarSign }, // Represents digital yuan and mobile payments (WeChat Pay, Alipay)
  { id: "taiwan", title: "Taiwan", subtitle: "TWD • Banking Systems", Icon: Banknote }, // Represents New Taiwan Dollar and local banking
  { id: "malaysia", title: "Malaysia", subtitle: "MYR • E-Wallets", Icon: Coins }, // Represents Malaysian Ringgit and e-wallet systems
  { id: "korea", title: "Korea", subtitle: "KRW • Digital Pay", Icon: Zap }, // Represents Korean Won and fast digital payments (KakaoPay, Naver Pay)
]

type SecondaryBarProps = {
  selectedSubItem: string
  onSubItemSelected: (id: string) => void
  isVisible: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  usWiresMode: "track-trace" | "observability"
  onUSWiresModeChange: (mode: "track-trace" | "observability") => void
}

function SecondarySideBar({
  selectedSubItem,
  onSubItemSelected,
  isVisible,
  isCollapsed,
  onToggleCollapse,
  usWiresMode,
  onUSWiresModeChange,
}: SecondaryBarProps) {
  const [isApacExpanded, setIsApacExpanded] = useState(false)

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
                    selectedSubItem === item.id ? "text-white shadow-md" : "text-foreground hover:bg-accent",
                  )}
                  style={selectedSubItem === item.id ? { backgroundColor: "#1d4ed8" } : undefined}
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
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FLOW DIAGRAMS</h3>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="text-xs font-medium text-gray-700 mb-2">View Mode</div>
                <div className="flex items-center bg-white rounded-md p-0.5 border shadow-sm">
                  <button
                    onClick={() => onUSWiresModeChange("track-trace")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-sm transition-all text-xs font-medium flex-1 justify-center whitespace-nowrap",
                      usWiresMode === "track-trace"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    <Search className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Track</span>
                  </button>
                  <button
                    onClick={() => onUSWiresModeChange("observability")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-sm transition-all text-xs font-medium flex-1 justify-center whitespace-nowrap",
                      usWiresMode === "observability"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Monitor</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <nav className="space-y-1 mt-3">
            {paymentFlowItems.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => onSubItemSelected(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    selectedSubItem === item.id ? "text-white shadow-md" : "text-foreground hover:bg-accent",
                    isCollapsed && "justify-center py-2",
                  )}
                  style={selectedSubItem === item.id ? { backgroundColor: "#1d4ed8" } : undefined}
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
              )
            })}

            {!isCollapsed && (
              <div>
                <button
                  onClick={() => setIsApacExpanded(!isApacExpanded)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors text-foreground hover:bg-accent"
                >
                  <Globe className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">APAC</div>
                    <div className="text-xs opacity-75 mt-0.5">Asia Pacific Payment Flows</div>
                  </div>
                  {isApacExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 mt-1" />
                  )}
                </button>

                {isApacExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {apacCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => onSubItemSelected(country.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          selectedSubItem === country.id ? "text-white shadow-md" : "text-foreground hover:bg-accent",
                        )}
                        style={selectedSubItem === country.id ? { backgroundColor: "#1d4ed8" } : undefined}
                      >
                        <country.Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{country.title}</div>
                          <div className="text-xs opacity-75 mt-0.5">{country.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isCollapsed && (
              <button
                onClick={() => setIsApacExpanded(!isApacExpanded)}
                className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-foreground hover:bg-accent"
                title="APAC"
              >
                <Globe className="h-5 w-5" />
              </button>
            )}
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
  const [usWiresMode, setUSWiresMode] = useState<"track-trace" | "observability">("track-trace")

  const renderContent = () => {
    switch (selectedSubItem) {
      case "us-wires":
        return (
          <USWiresToggleContent mode={usWiresMode} onModeChange={setUSWiresMode}>
            {children}
          </USWiresToggleContent>
        )
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
      case "china":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">China Payment Flow</h1>
            <p className="text-muted-foreground">China payment flow monitoring content coming soon.</p>
          </div>
        )
      case "taiwan":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Taiwan Payment Flow</h1>
            <p className="text-muted-foreground">Taiwan payment flow monitoring content coming soon.</p>
          </div>
        )
      case "malaysia":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Malaysia Payment Flow</h1>
            <p className="text-muted-foreground">Malaysia payment flow monitoring content coming soon.</p>
          </div>
        )
      case "korea":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Korea Payment Flow</h1>
            <p className="text-muted-foreground">Korea payment flow monitoring content coming soon.</p>
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
            usWiresMode={usWiresMode}
            onUSWiresModeChange={setUSWiresMode}
          />
        </div>
        <main className="bg-background flex flex-1 flex-col">{renderContent()}</main>
      </div>
    </TransactionSearchProvider>
  )
}
