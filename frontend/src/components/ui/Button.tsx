import type { ReactNode, ButtonHTMLAttributes } from "react"
import Spinner from "./Spinner"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-700 hover:bg-slate-600 text-white",
  ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
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
