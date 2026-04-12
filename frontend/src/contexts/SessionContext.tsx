import { createContext, useContext, useEffect, useState } from "react"
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
  const [userId] = useState<string>(CONFIG.DEFAULT_USER_ID)
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>("")

  const addSession = (sessionId: string) => {
    const now = new Date().toISOString()
    storage.sessions.create({ id: sessionId, user_id: userId, title: "New Chat", created_at: now, updated_at: now })
    const session: Session = { id: sessionId, createdAt: now }
    setSessions((prev) => [...prev, session])
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
    const stored = storage.sessions.getAll(userId)
    if (stored.length > 0) {
      const mapped: Session[] = stored.map((s) => ({ id: s.id, createdAt: s.created_at }))
      setSessions(mapped)
      setActiveSessionId(mapped[0].id)
      chatClient.createSession(userId, mapped[0].id).catch(() => {})
      stored.slice(1).forEach((s) => {
        chatClient.createSession(userId, s.id).catch(() => {})
      })
    } else {
      const init = async () => {
        const sessionId = generateId()
        try {
          await chatClient.createSession(userId, sessionId)
        } catch {
        }
        addSession(sessionId)
      }
      init()
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
