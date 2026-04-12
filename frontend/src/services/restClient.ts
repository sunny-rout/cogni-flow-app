import { CONFIG } from "../config/env"
import type { Task, Note, Event } from "../types"

class RestClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    const json = await response.json()
    return (json && "data" in json ? json.data : json) as T
  }

  async getTasks(status?: string): Promise<Task[]> {
    const query = status ? `/status/${encodeURIComponent(status)}` : ""
    return this.request<Task[]>(`/api/tasks${query}`)
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`)
  }

  async createTask(title: string, description: string, priority: string, dueDate?: string): Promise<Task> {
    const params = new URLSearchParams({ title, description, priority })
    if (dueDate) params.set("due_date", dueDate)
    return this.request<Task>(`/api/tasks?${params.toString()}`, { method: "POST" })
  }

  async updateTask(id: number, fields: Partial<Task>): Promise<Task> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value))
      }
    }
    return this.request<Task>(`/api/tasks/${id}?${params.toString()}`, { method: "PATCH" })
  }

  async deleteTask(id: number): Promise<void> {
    await this.request<void>(`/api/tasks/${id}`, { method: "DELETE" })
  }

  async searchTasks(keyword: string): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks/search/${encodeURIComponent(keyword)}`)
  }

  async getNotes(): Promise<Note[]> {
    return this.request<Note[]>("/api/notes")
  }

  async getNote(id: number): Promise<Note> {
    return this.request<Note>(`/api/notes/${id}`)
  }

  async createNote(title: string, content: string, tags: string): Promise<Note> {
    const params = new URLSearchParams({ title, content, tags })
    return this.request<Note>(`/api/notes?${params.toString()}`, { method: "POST" })
  }

  async updateNote(id: number, fields: Partial<Note>): Promise<Note> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        params.set(key, Array.isArray(value) ? value.join(",") : String(value))
      }
    }
    return this.request<Note>(`/api/notes/${id}?${params.toString()}`, { method: "PATCH" })
  }

  async deleteNote(id: number): Promise<void> {
    await this.request<void>(`/api/notes/${id}`, { method: "DELETE" })
  }

  async searchNotes(keyword: string): Promise<Note[]> {
    return this.request<Note[]>(`/api/notes/search/${encodeURIComponent(keyword)}`)
  }

  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>("/api/events/")
  }

  async getEvent(id: number): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`)
  }

  async createEvent(title: string, startTime: string, endTime: string, description?: string, location?: string): Promise<Event> {
    const params = new URLSearchParams({ title, start_time: startTime, end_time: endTime })
    if (description) params.set("description", description)
    if (location) params.set("location", location)
    return this.request<Event>(`/api/events?${params.toString()}`, { method: "POST" })
  }

  async updateEvent(id: number, fields: Partial<Event>): Promise<Event> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value))
      }
    }
    return this.request<Event>(`/api/events/${id}?${params.toString()}`, { method: "PATCH" })
  }

  async deleteEvent(id: number): Promise<void> {
    await this.request<void>(`/api/events/${id}`, { method: "DELETE" })
  }

  async searchEvents(keyword: string): Promise<Event[]> {
    return this.request<Event[]>(`/api/events/search/${encodeURIComponent(keyword)}`)
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

export const restClient = new RestClient(CONFIG.BASE_URL)
