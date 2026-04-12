import { useEffect, useState } from "react"
import Layout from "../components/layout/Layout"
import { useNotes } from "../hooks/useNotes"
import { useToast } from "../hooks/useToast"
import Modal from "../components/ui/Modal"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Badge from "../components/ui/Badge"
import Card from "../components/ui/Card"
import Skeleton from "../components/ui/Skeleton"
import EmptyState from "../components/ui/EmptyState"
import { truncateText, parseTagsFromString } from "../utils"
import type { Note } from "../types"

interface NoteForm {
  title: string
  content: string
  tags: string
}

const defaultForm: NoteForm = { title: "", content: "", tags: "" }

export default function Notes() {
  const { notes, isLoading, error, loadNotes, createNote, updateNote, deleteNote, searchNotes, clearSearch } = useNotes()
  const { addToast } = useToast()

  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [form, setForm] = useState<NoteForm>(defaultForm)

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    if (error) addToast(error, "error")
  }, [error])

  const handleSearch = () => {
    if (search.trim()) searchNotes(search.trim())
    else clearSearch()
  }

  const openNew = () => {
    setEditingNote(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setForm({
      title: note.title,
      content: note.content,
      tags: note.tags?.join(", ") ?? "",
    })
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    setForm(defaultForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: form.title,
          content: form.content,
          tags: parseTagsFromString(form.tags),
        })
        addToast("Note updated!", "success")
      } else {
        await createNote(form.title, form.content, form.tags)
        addToast("Note created!", "success")
      }
      handleClose()
      loadNotes()
    } catch {
      addToast("Failed to save note", "error")
    }
  }

  const handleDelete = async (note: Note) => {
    if (!confirm(`Delete "${note.title}"?`)) return
    try {
      await deleteNote(note.id)
      addToast("Note deleted", "success")
    } catch {
      addToast("Failed to delete note", "error")
    }
  }

  return (
    <Layout title="Notes">
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex gap-3">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search notes..."
              className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <Button variant="secondary" onClick={handleSearch} size="md">Search</Button>
          </div>
          <Button variant="primary" onClick={openNew} size="md">+ New Note</Button>
        </div>

        {isLoading && notes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-lg p-4 space-y-3">
                <Skeleton height="20px" width="60%" />
                <Skeleton height="14px" width="100%" />
                <Skeleton height="14px" width="80%" />
                <div className="flex gap-2">
                  <Skeleton height="20px" width="50px" rounded />
                  <Skeleton height="20px" width="60px" rounded />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No notes yet"
            message="Create your first note to get started!"
            actionLabel="+ New Note"
            onAction={openNew}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary text-sm flex-1 truncate">{note.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(note)}
                        className="text-xs text-muted hover:text-text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note)}
                        className="text-xs text-muted hover:text-danger transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {note.content && (
                    <p className="text-muted text-xs mb-3 leading-relaxed">
                      {truncateText(note.content, 120)}
                    </p>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} text={tag} colorClass="text-success border border-success" />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingNote ? "Edit Note" : "New Note"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Note title"
            required
          />
          <Textarea
            label="Content *"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your note..."
            rows={5}
          />
          <Input
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="work, ideas, personal"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
              {editingNote ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
