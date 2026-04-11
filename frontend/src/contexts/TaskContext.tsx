import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { restClient } from "../services/restClient"
import type { Task } from "../types"

type TaskFilter = "all" | "pending" | "in_progress" | "done"

interface TaskContextType {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filter: TaskFilter
  loadTasks: () => void
  loadByStatus: (status: string) => void
  createTask: (title: string, description: string, priority: string, dueDate?: string) => void
  updateTask: (id: number, fields: Partial<Task>) => void
  updateStatus: (id: number, status: string) => void
  deleteTask: (id: number) => void
  searchTasks: (keyword: string) => void
  setFilter: (filter: TaskFilter) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TaskFilter>("all")

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.getTasks()
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const loadByStatus = async (status: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.getTasks(status)
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (title: string, description: string, priority: string, dueDate?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const task = await restClient.createTask(title, description, priority, dueDate)
      setTasks((prev) => [...prev, task])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (id: number, fields: Partial<Task>) => {
    setIsLoading(true)
    setError(null)
    try {
      const updated = await restClient.updateTask(id, fields)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update task")
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    await updateTask(id, { status: status as Task["status"] })
  }

  const deleteTask = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await restClient.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete task")
    } finally {
      setIsLoading(false)
    }
  }

  const searchTasks = async (keyword: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.searchTasks(keyword)
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search tasks")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TaskContext.Provider value={{ tasks, isLoading, error, filter, loadTasks, loadByStatus, createTask, updateTask, updateStatus, deleteTask, searchTasks, setFilter }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider")
  return ctx
}
