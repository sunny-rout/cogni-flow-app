import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CONFIG } from "../config/env"
import { chatClient } from "../services/chatClient"
import { generateId } from "../utils"
import { storage } from "../lib/storage"
import type { Session } from "../types"

interface SessionContextType {
  userId: string
  sessionId: string
  sessions: Session[]
  createSession: () => void
  switchSession: (id: string) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId] = useState<string>(
    () => localStorage.getItem("cogniflow_user_id") || CONFIG.DEFAULT_USER_ID
  )
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")
  const initialized = useRef(false)

  const addSession = (sessionId: string) => {
    const now = new Date().toISOString()
    if (!storage.sessions.getById(sessionId)) {
      storage.sessions.create({ id: sessionId, user_id: userId, title: "New Chat", created_at: now, updated_at: now })
    }
    const session: Session = { id: sessionId, createdAt: now }
    setSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) return prev
      return [...prev, session]
    })
    setActiveSessionId(sessionId)
  }

  const createSession = async () => {
    const sessionId = generateId()
    try {
      await chatClient.createSession(userId, sessionId)
    } catch {
    }
    addSession(sessionId)
  }

  const switchSession = (id: string) => {
    setActiveSessionId(id)
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const stored = storage.sessions.getAll(userId)
    if (stored.length > 0) {
      const mapped: Session[] = stored.map((s) => ({ id: s.id, createdAt: s.created_at }))
      setSessions(mapped)
      setActiveSessionId(mapped[0].id)
      stored.forEach((s) => {
        chatClient.createSession(userId, s.id).catch(() => {})
      })
    } else {
      const sessionId = generateId()
      chatClient.createSession(userId, sessionId).catch(() => {})
      addSession(sessionId)
    }
  }, [])

  return (
    <SessionContext.Provider value={{ userId, sessionId: activeSessionId, sessions, createSession, switchSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}
