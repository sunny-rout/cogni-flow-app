import type { TextareaHTMLAttributes } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  rows?: number
}

export default function Textarea({ label, rows = 4, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-slate-400 font-medium">{label}</label>
      )}
      <textarea
        {...props}
        rows={rows}
        className={`
          px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm
          placeholder:text-slate-500 resize-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `.trim()}
      />
    </div>
  )
}
