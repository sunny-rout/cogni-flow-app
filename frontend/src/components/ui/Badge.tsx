interface BadgeProps {
  text: string
  colorClass: string
}

export default function Badge({ text, colorClass }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${colorClass}`}>
      {text}
    </span>
  )
}
