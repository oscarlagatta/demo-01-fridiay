import type React from "react"
import { Loader2 } from "lucide-react"

interface HighContrastButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
  variant?: "enabled" | "disabled" | "loading"
}

export function HighContrastButton({
  isLoading = false,
  loadingText = "Loading...",
  children,
  variant = "enabled",
  className = "",
  style,
  ...props
}: HighContrastButtonProps) {
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      fontSize: "10px",
      fontWeight: "500",
      border: "1px solid",
      cursor: variant === "disabled" ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      opacity: 1, // Force full opacity
      ...style,
    }

    switch (variant) {
      case "enabled":
        return {
          ...baseStyle,
          backgroundColor: "#1d4ed8", // Blue-700
          color: "#ffffff",
          borderColor: "#1d4ed8",
        }
      case "disabled":
        return {
          ...baseStyle,
          backgroundColor: "#374151", // Gray-700 for better contrast
          color: "#ffffff",
          borderColor: "#374151",
        }
      case "loading":
        return {
          ...baseStyle,
          backgroundColor: "#1d4ed8", // Blue-700
          color: "#ffffff",
          borderColor: "#1d4ed8",
        }
      default:
        return baseStyle
    }
  }

  return (
    <button style={getButtonStyle()} className={className} disabled={variant === "disabled" || isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
