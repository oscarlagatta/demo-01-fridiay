import type React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  className?: string
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link" | "solid"
  size?: "default" | "sm" | "lg" | "icon"
  style?: React.CSSProperties
}

export function LoadingButton({
  isLoading,
  loadingText = "Loading...",
  children,
  className,
  variant = "default",
  size = "default",
  style,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      style={style}
      className={cn(
        "transition-all duration-200",
        isLoading && "cursor-not-allowed",
        style && "!opacity-100",
        className,
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          <span className="text-[10px]">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
