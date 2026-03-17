"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react"

interface TourStep {
  target: string
  title: string
  content: string
  placement: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="dashboard-title"]',
    title: "Welcome to Payment Dashboard!",
    content: "This is your central hub for monitoring payment flows and transactions. Let's take a quick tour of the key features.",
    placement: "bottom",
  },
  {
    target: '[data-tour="search-box"]',
    title: "Payment Search",
    content: "Use this search box to quickly find specific transactions, payments, or flow data. You can search by transaction ID, amount, or other criteria.",
    placement: "bottom",
  },
  {
    target: '[data-tour="node-manager"]',
    title: "Node Manager",
    content: "Access the Node Manager to configure and manage payment processing nodes, connections, and system settings.",
    placement: "bottom",
  },
  {
    target: '[data-tour="main-diagram"]',
    title: "Main Diagram Area",
    content: "This is where the selected payment flow diagram is displayed. You can interact with nodes, view transaction details, and monitor real-time data.",
    placement: "top",
  },
]

interface GuidedTourProps {
  autoStart?: boolean
  onTourComplete?: () => void
}

export function GuidedTour({ autoStart = false, onTourComplete }: GuidedTourProps) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [tourCompleted, setTourCompleted] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("payment-dashboard-tour-completed")
    setTourCompleted(hasCompletedTour === "true")

    if (autoStart && !hasCompletedTour) {
      setTimeout(() => setRun(true), 1000)
    }
  }, [autoStart])

  const updateTooltipPosition = useCallback(() => {
    if (!run) return

    const currentStep = tourSteps[stepIndex]
    const targetElement = document.querySelector(currentStep.target)

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      const scrollTop = window.scrollY
      const scrollLeft = window.scrollX

      let top = 0
      let left = 0

      switch (currentStep.placement) {
        case "bottom":
          top = rect.bottom + scrollTop + 12
          left = rect.left + scrollLeft + rect.width / 2 - 175
          break
        case "top":
          top = rect.top + scrollTop - 12 - 150
          left = rect.left + scrollLeft + rect.width / 2 - 175
          break
        case "left":
          top = rect.top + scrollTop + rect.height / 2 - 75
          left = rect.left + scrollLeft - 362
          break
        case "right":
          top = rect.top + scrollTop + rect.height / 2 - 75
          left = rect.right + scrollLeft + 12
          break
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - 366))
      top = Math.max(16, top)

      setTooltipPosition({ top, left })

      // Scroll target into view if needed
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [run, stepIndex])

  useEffect(() => {
    updateTooltipPosition()
    window.addEventListener("resize", updateTooltipPosition)
    window.addEventListener("scroll", updateTooltipPosition)

    return () => {
      window.removeEventListener("resize", updateTooltipPosition)
      window.removeEventListener("scroll", updateTooltipPosition)
    }
  }, [updateTooltipPosition])

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      finishTour()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    }
  }

  const finishTour = () => {
    setRun(false)
    setTourCompleted(true)
    localStorage.setItem("payment-dashboard-tour-completed", "true")
    onTourComplete?.()
  }

  const skipTour = () => {
    finishTour()
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

  const currentStep = tourSteps[stepIndex]

  return (
    <>
      {/* Overlay */}
      {run && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9998]"
          onClick={skipTour}
        />
      )}

      {/* Tooltip */}
      {run && (
        <Card
          className="fixed z-[9999] w-[350px] shadow-xl"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">{currentStep.title}</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={skipTour}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{currentStep.content}</p>
            
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === stepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={skipTour}>
                Skip Tour
              </Button>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {stepIndex === tourSteps.length - 1 ? "Finish" : "Next"}
                  {stepIndex < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tour Control Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {!run && (
          <Button
            onClick={startTour}
            variant="outline"
            size="sm"
            className="bg-background shadow-lg border-border hover:bg-accent"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {tourCompleted ? "Retake Tour" : "Start Tour"}
          </Button>
        )}

        {tourCompleted && !run && (
          <Button
            onClick={resetTour}
            variant="ghost"
            size="sm"
            className="bg-background shadow-lg border border-border hover:bg-accent"
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
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        Step {currentStep + 1} of {totalSteps}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i <= currentStep ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  )
}
