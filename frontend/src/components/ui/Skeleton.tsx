interface SkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
  className?: string
}

export default function Skeleton({ width, height, rounded = false, className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-700 ${rounded ? "rounded-full" : "rounded"} ${className}`}
      style={{ width, height }}
    />
  )
}
