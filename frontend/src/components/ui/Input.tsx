import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-slate-400 font-medium">{label}</label>
      )}
      <input
        {...props}
        className={`
          px-3 py-2 bg-slate-900 border rounded-lg text-white text-sm
          placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-slate-700"}
          ${className}
        `.trim()}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
