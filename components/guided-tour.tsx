"use client"

import { useState, useEffect } from "react"
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride"
import { Button } from "@/components/ui/button"
import { HelpCircle, RotateCcw } from "lucide-react"

// Tour steps configuration
const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard-title"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Welcome to Payment Dashboard!</h3>
        <p>
          This is your central hub for monitoring payment flows and transactions. Let's take a quick tour of the key
          features.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
    isFixed: true,
  },
  {
    target: '[data-tour="search-box"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Search</h3>
        <p>
          Use this search box to quickly find specific transactions, payments, or flow data. You can search by
          transaction ID, amount, or other criteria.
        </p>
      </div>
    ),
    placement: "bottom",
    isFixed: true,
  },
  {
    target: '[data-tour="sidebar-navigation"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Navigation Sidebar</h3>
        <p>
          This sidebar contains all the main navigation options. You can access different payment flows, analytics, and
          system management features from here.
        </p>
      </div>
    ),
    placement: "right",
    isFixed: true,
  },
  {
    target: '[data-tour="view-mode-toggle"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">View Mode Toggle</h3>
        <p>
          Switch between <strong>Track</strong> mode for transaction tracking and <strong>Monitor</strong> mode for
          observability and monitoring features.
        </p>
      </div>
    ),
    placement: "right",
    isFixed: true,
  },
  {
    target: '[data-tour="flow-diagrams"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Flow Diagrams</h3>
        <p>
          Select different payment flows like US Wires, International Wires, or regional payment systems. Each flow
          shows detailed monitoring and tracking information.
        </p>
      </div>
    ),
    placement: "right",
    isFixed: true,
  },
  {
    target: '[data-tour="main-diagram"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Main Diagram Area</h3>
        <p>
          This is where the selected payment flow diagram is displayed. You can interact with nodes, view transaction
          details, and monitor real-time data.
        </p>
      </div>
    ),
    placement: "top",
    isFixed: true,
  },
  {
    target: '[data-tour="node-manager"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Node Manager</h3>
        <p>
          Access the Node Manager to configure and manage payment processing nodes, connections, and system settings.
        </p>
      </div>
    ),
    placement: "bottom",
    isFixed: true,
  },
  {
    target: '[data-tour="testing-panel"]',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Testing Panel</h3>
        <p>
          Use this panel to test payment flows, simulate transactions, and validate system configurations before going
          live.
        </p>
      </div>
    ),
    placement: "top",
    isFixed: true,
  },
]

// Custom tour styles
const tourStyles = {
  options: {
    primaryColor: "#1d4ed8",
    textColor: "#374151",
    backgroundColor: "#ffffff",
    overlayColor: "rgba(0, 0, 0, 0.4)",
    spotlightShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
    beaconSize: 36,
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 8,
    fontSize: 14,
    padding: 20,
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },
  buttonNext: {
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 500,
    padding: "8px 16px",
  },
  buttonBack: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 500,
    marginRight: 10,
  },
  buttonSkip: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 500,
  },
}

interface GuidedTourProps {
  autoStart?: boolean
  onTourComplete?: () => void
}

export function GuidedTour({ autoStart = false, onTourComplete }: GuidedTourProps) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [tourCompleted, setTourCompleted] = useState(false)

  // Check if user has completed the tour before
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("payment-dashboard-tour-completed")
    setTourCompleted(hasCompletedTour === "true")

    // Auto-start tour for new users
    if (autoStart && !hasCompletedTour) {
      setTimeout(() => setRun(true), 1000) // Delay to ensure DOM is ready
    }
  }, [autoStart])

  useEffect(() => {
    if (run) {
      // Prevent body scrolling when tour is active
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
    } else {
      // Restore body scrolling when tour is inactive
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }
  }, [run])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data

    if (type === "step:after") {
      setStepIndex(index + 1)
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      setTourCompleted(true)
      localStorage.setItem("payment-dashboard-tour-completed", "true")
      onTourComplete?.()
    }
  }

  const startTour = () => {
    setRun(true)
    setStepIndex(0)
  }

  const resetTour = () => {
    localStorage.removeItem("payment-dashboard-tour-completed")
    setTourCompleted(false)
    setRun(true)
    setStepIndex(0)
  }

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={run}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        styles={tourStyles}
        disableScrolling={true}
        disableScrollParentFix={true}
        spotlightClicks={false}
        disableOverlayClose={false}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish Tour",
          next: "Next",
          skip: "Skip Tour",
        }}
        floaterProps={{
          disableAnimation: false,
          options: {
            preventOverflow: {
              boundariesElement: "viewport",
            },
          },
        }}
      />

      {/* Tour Control Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {!run && (
          <Button
            onClick={startTour}
            variant="outline"
            size="sm"
            className="bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {tourCompleted ? "Retake Tour" : "Start Tour"}
          </Button>
        )}

        {tourCompleted && (
          <Button
            onClick={resetTour}
            variant="ghost"
            size="sm"
            className="bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Tour
          </Button>
        )}
      </div>
    </>
  )
}

// Hook for managing tour state
export function useTour() {
  const [isTourActive, setIsTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  const startTour = () => {
    setIsTourActive(true)
    setTourStep(0)
  }

  const stopTour = () => {
    setIsTourActive(false)
    setTourStep(0)
  }

  const nextStep = () => {
    setTourStep((prev) => Math.min(prev + 1, tourSteps.length - 1))
  }

  const prevStep = () => {
    setTourStep((prev) => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    setTourStep(Math.max(0, Math.min(step, tourSteps.length - 1)))
  }

  return {
    isTourActive,
    tourStep,
    totalSteps: tourSteps.length,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
  }
}

// Tour progress indicator component
export function TourProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>
        Step {currentStep + 1} of {totalSteps}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i <= currentStep ? "bg-blue-600" : "bg-gray-300"}`} />
        ))}
      </div>
    </div>
  )
}
