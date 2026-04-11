import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { restClient } from "../services/restClient"
import type { Note } from "../types"

interface NotesContextType {
  notes: Note[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  loadNotes: () => void
  createNote: (title: string, content: string, tags: string) => void
  updateNote: (id: number, fields: Partial<Note>) => void
  deleteNote: (id: number) => void
  searchNotes: (keyword: string) => void
  clearSearch: () => void
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadNotes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await restClient.getNotes()
      setNotes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  const createNote = async (title: string, content: string, tags: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const note = await restClient.createNote(title, content, tags)
      setNotes((prev) => [...prev, note])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create note")
    } finally {
      setIsLoading(false)
    }
  }

  const updateNote = async (id: number, fields: Partial<Note>) => {
    setIsLoading(true)
    setError(null)
    try {
      const updated = await restClient.updateNote(id, fields)
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update note")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (id: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await restClient.deleteNote(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete note")
    } finally {
      setIsLoading(false)
    }
  }

  const searchNotes = async (keyword: string) => {
    setIsLoading(true)
    setError(null)
    setSearchQuery(keyword)
    try {
      const data = await restClient.searchNotes(keyword)
      setNotes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search notes")
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    loadNotes()
  }

  return (
    <NotesContext.Provider value={{ notes, isLoading, error, searchQuery, loadNotes, createNote, updateNote, deleteNote, searchNotes, clearSearch }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotesContext() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error("useNotesContext must be used within NotesProvider")
  return ctx
}
