import { useEffect, useState } from "react"
import Layout from "../components/layout/Layout"
import { useTasks } from "../hooks/useTasks"
import { useToast } from "../hooks/useToast"
import Modal from "../components/ui/Modal"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Select from "../components/ui/Select"
import Badge from "../components/ui/Badge"
import Card from "../components/ui/Card"
import Skeleton from "../components/ui/Skeleton"
import EmptyState from "../components/ui/EmptyState"
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from "../constants"
import { formatDate } from "../utils"
import type { Task } from "../types"

type FilterType = "all" | "pending" | "in_progress" | "done"

const filterTabs: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

const priorityAccentColors: Record<string, string> = {
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
}

interface TaskForm {
  title: string
  description: string
  priority: string
  due_date: string
}

const defaultForm: TaskForm = { title: "", description: "", priority: "medium", due_date: "" }

export default function Tasks() {
  const { tasks, isLoading, error, filter, loadTasks, loadByStatus, createTask, updateTask, deleteTask, searchTasks, setFilter } = useTasks()
  const { addToast } = useToast()

  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskForm>(defaultForm)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    if (error) addToast(error, "error")
  }, [error])

  const handleFilterChange = (f: FilterType) => {
    setFilter(f)
    if (f === "all") loadTasks()
    else loadByStatus(f)
  }

  const handleSearch = () => {
    if (search.trim()) searchTasks(search.trim())
    else loadTasks()
  }

  const openNew = () => {
    setEditingTask(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    })
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setForm(defaultForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: form.title,
          description: form.description,
          priority: form.priority as Task["priority"],
          due_date: form.due_date || null,
        })
        addToast("Task updated!", "success")
      } else {
        await createTask(form.title, form.description, form.priority, form.due_date || undefined)
        addToast("Task created!", "success")
      }
      handleClose()
      loadTasks()
    } catch {
      addToast("Failed to save task", "error")
    }
  }

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return
    try {
      await deleteTask(task.id)
      addToast("Task deleted", "success")
    } catch {
      addToast("Failed to delete task", "error")
    }
  }

  return (
    <Layout title="Tasks">
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2 flex-[0_0_65%]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search tasks..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button variant="secondary" onClick={handleSearch} size="md">Search</Button>
          </div>
          <Button variant="primary" onClick={openNew} size="md">+ New Task</Button>
        </div>

        {isLoading && tasks.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 space-y-3">
                <Skeleton height="20px" width="50%" />
                <Skeleton height="14px" width="30%" />
                <div className="flex gap-2">
                  <Skeleton height="20px" width="60px" />
                  <Skeleton height="20px" width="80px" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="✓"
            title="No tasks yet"
            message="Create your first task to get started!"
            actionLabel="+ New Task"
            onAction={openNew}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} accentColor={priorityAccentColors[task.priority]}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{task.title}</h3>
                      {task.due_date && (
                        <p className="text-xs text-slate-500 mt-0.5">Due {formatDate(task.due_date)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(task)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
                        className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge text={PRIORITY_LABELS[task.priority]} colorClass={PRIORITY_COLORS[task.priority]} />
                    <Badge text={STATUS_LABELS[task.status]} colorClass={STATUS_COLORS[task.status]} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingTask ? "Edit Task" : "New Task"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title"
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={priorityOptions}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
              {editingTask ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
