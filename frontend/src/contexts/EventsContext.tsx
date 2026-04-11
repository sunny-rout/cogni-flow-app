import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { restClient } from "../services/restClient"
import type { Event } from "../types"

type EventFilter = "upcoming" | "all"

interface EventsContextType {
  events: Event[]
  isLoading: boolean
  error: string | null
  filter: EventFilter
  loadEvents: (fromDate?: string) => void
  createEvent: (title: string, startTime: string, endTime: string, description?: string, location?: string) => void
  updateEvent: (id: number, fields: Partial<Event>) => void
  deleteEvent: (id: number) => void
  searchEvents: (keyword: string) => void
  setFilter: (filter: EventFilter) => void
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<EventFilter>("all")

  const loadEvents = async (fromDate?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.getEvents(fromDate)
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const createEvent = async (title: string, startTime: string, endTime: string, description?: string, location?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const event = await restClient.createEvent(title, startTime, endTime, description, location)
      setEvents((prev) => [...prev, event])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  const updateEvent = async (id: number, fields: Partial<Event>) => {
    setIsLoading(true)
    setError(null)
    try {
      const updated = await restClient.updateEvent(id, fields)
      setEvents((prev) => prev.map((ev) => (ev.id === id ? updated : ev)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEvent = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await restClient.deleteEvent(id)
      setEvents((prev) => prev.filter((ev) => ev.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete event")
    } finally {
      setIsLoading(false)
    }
  }

  const searchEvents = async (keyword: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.searchEvents(keyword)
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search events")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EventsContext.Provider value={{ events, isLoading, error, filter, loadEvents, createEvent, updateEvent, deleteEvent, searchEvents, setFilter }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEventsContext() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error("useEventsContext must be used within EventsProvider")
  return ctx
}
