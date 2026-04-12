import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-muted font-medium">{label}</label>
      )}
      <input
        {...props}
        className={`
          px-3 py-2 bg-bg border rounded-lg text-text-primary text-sm
          placeholder:text-muted/50
          focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-danger" : "border-border"}
          ${className}
        `.trim()}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
