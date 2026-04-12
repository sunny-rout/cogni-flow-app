import type { ReactNode, ButtonHTMLAttributes } from "react"
import Spinner from "./Spinner"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

const variantClasses = {
  primary: "bg-accent hover:bg-accent-hover text-white",
  secondary: "bg-card hover:bg-border text-text-primary",
  ghost: "bg-transparent hover:bg-card text-muted hover:text-text-primary",
  danger: "bg-danger hover:bg-danger-hover text-white",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
