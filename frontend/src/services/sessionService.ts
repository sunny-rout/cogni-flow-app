import { generateId } from "../utils"
import type { Session } from "../types"

class SessionService {
  private sessions: Session[] = []
  private activeSessionId: string | null = null

  createNew(): Session {
    const session: Session = {
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    this.sessions.push(session)
    return session
  }

  getAll(): Session[] {
    return [...this.sessions]
  }

  getById(id: string): Session | null {
    return this.sessions.find((s) => s.id === id) ?? null
  }

  setActive(id: string): void {
    this.activeSessionId = id
  }

  getActive(): Session | null {
    if (!this.activeSessionId) return null
    return this.getById(this.activeSessionId)
  }
}

export const sessionService = new SessionService()
