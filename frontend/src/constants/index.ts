export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const PRIORITY_COLORS = {
  low: "bg-accent/20 text-accent border border-accent/40",
  medium: "bg-warning/20 text-warning border border-warning/40",
  high: "bg-danger/20 text-danger border border-danger/40",
}

export const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
}

export const STATUS_COLORS = {
  pending: "bg-warning/20 text-warning border border-warning/40",
  in_progress: "bg-accent/20 text-accent border border-accent/40",
  done: "bg-success/20 text-success border border-success/40",
}

export const AGENT_COLORS: Record<string, string> = {
  task_agent: "#f59e0b",
  notes_agent: "#10b981",
  schedule_agent: "#3b82f6",
  default: "#94a3b8",
}
