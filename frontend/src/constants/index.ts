export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const PRIORITY_COLORS = {
  low: "text-accent border border-accent",
  medium: "text-warning border border-warning",
  high: "text-danger border border-danger",
}

export const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
}

export const STATUS_COLORS = {
  pending: "text-warning border border-warning",
  in_progress: "text-accent border border-accent",
  done: "text-success border border-success",
}

export const AGENT_COLORS: Record<string, string> = {
  task_agent: "#f59e0b",
  notes_agent: "#10b981",
  schedule_agent: "#3b82f6",
  default: "#94a3b8",
}
