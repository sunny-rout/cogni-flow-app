import { useEffect, useState } from "react"
import Layout from "../components/layout/Layout"
import { useEvents } from "../hooks/useEvents"
import { useToast } from "../hooks/useToast"
import Modal from "../components/ui/Modal"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Badge from "../components/ui/Badge"
import Card from "../components/ui/Card"
import Skeleton from "../components/ui/Skeleton"
import EmptyState from "../components/ui/EmptyState"
import { formatDateTime } from "../utils"
import type { Event } from "../types"

type FilterType = "upcoming" | "all"

interface EventForm {
  title: string
  start_time: string
  end_time: string
  location: string
  description: string
}

const defaultForm: EventForm = { title: "", start_time: "", end_time: "", location: "", description: "" }

export default function Events() {
  const { events, isLoading, error, filter, loadEvents, createEvent, updateEvent, deleteEvent, searchEvents, setFilter } = useEvents()
  const { addToast } = useToast()

  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState<EventForm>(defaultForm)

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (error) addToast(error, "error")
  }, [error])

  const handleFilterChange = (f: FilterType) => {
    setFilter(f)
    setSearch("")
  }

  const handleSearch = () => {
    if (search.trim()) searchEvents(search.trim())
    else loadEvents()
  }

  const openNew = () => {
    setEditingEvent(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (event: Event) => {
    setEditingEvent(event)
    setForm({
      title: event.title,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      location: event.location ?? "",
      description: event.description ?? "",
    })
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setForm(defaultForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start_time || !form.end_time) return
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          title: form.title,
          start_time: form.start_time,
          end_time: form.end_time,
          location: form.location,
          description: form.description,
        })
        addToast("Event updated!", "success")
      } else {
        await createEvent(form.title, form.start_time, form.end_time, form.description || undefined, form.location || undefined)
        addToast("Event created!", "success")
      }
      handleClose()
      loadEvents()
    } catch {
      addToast("Failed to save event", "error")
    }
  }

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete "${event.title}"?`)) return
    try {
      await deleteEvent(event.id)
      addToast("Event deleted", "success")
    } catch {
      addToast("Failed to delete event", "error")
    }
  }

  const isUpcoming = (startTime: string) => new Date(startTime) > new Date()

  const now = new Date()
  const displayedEvents = filter === "upcoming"
    ? events.filter((e) => new Date(e.start_time) > now).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    : [...events].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <Layout title="Events">
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
          {([
            { value: "upcoming" as FilterType, label: "Upcoming" },
            { value: "all" as FilterType, label: "All" },
          ]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-card text-text-primary"
                  : "text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search events..."
              className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <Button variant="secondary" onClick={handleSearch} size="md">Search</Button>
          </div>
          <Button variant="primary" onClick={openNew} size="md">+ New Event</Button>
        </div>

        {isLoading && displayedEvents.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-lg p-4 space-y-3">
                <Skeleton height="20px" width="55%" />
                <Skeleton height="14px" width="40%" />
                <Skeleton height="14px" width="25%" />
              </div>
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events yet"
            message="Schedule your first event to get started!"
            actionLabel="+ New Event"
            onAction={openNew}
          />
        ) : (
          <div className="space-y-3">
            {displayedEvents.map((event) => (
              <Card key={event.id} accentColor="#3b82f6">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary text-sm truncate">{event.title}</h3>
                        {isUpcoming(event.start_time) && (
                          <Badge text="Upcoming" colorClass="text-accent border border-accent" />
                        )}
                      </div>
                      <p className="text-xs text-success">
                        {formatDateTime(event.start_time)} → {formatDateTime(event.end_time)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted mt-0.5">{event.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-xs text-muted hover:text-text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="text-xs text-muted hover:text-danger transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingEvent ? "Edit Event" : "New Event"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
            required
          />
          <Input
            label="Start Time *"
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            required
          />
          <Input
            label="End Time *"
            type="datetime-local"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            required
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Optional location"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
              {editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
