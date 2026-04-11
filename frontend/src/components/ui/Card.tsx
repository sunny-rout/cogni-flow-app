import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  accentColor?: string
  className?: string
}

export default function Card({ children, accentColor, className = "" }: CardProps) {
  return (
    <div
      className={`relative bg-slate-800 rounded-lg shadow overflow-hidden ${className}`}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className={accentColor ? "pl-4" : ""}>
        {children}
      </div>
    </div>
  )
}
