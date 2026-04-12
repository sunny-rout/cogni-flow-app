export interface Task {
  id: number
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "done"
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  created_at: string
  updated_at?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "model"
  text: string
  author?: string
  timestamp: string
  isStreaming?: boolean
}

export interface SSEEvent {
  content?: {
    role: string
    parts: Array<{ text?: string }>
  }
  author?: string
  turn_complete?: boolean
  turnComplete?: boolean
  partial?: boolean
}

export interface Session {
  id: string
  createdAt: string
}

export interface ToastMessage {
  id: string
  type: "success" | "error" | "info"
  message: string
}

export interface ChatRequest {
  app_name: string
  user_id: string
  session_id: string
  new_message: {
    role: string
    parts: Array<{ text: string }>
  }
}
