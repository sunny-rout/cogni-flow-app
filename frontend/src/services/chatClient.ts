import { CONFIG } from "../config/env"
import type { Session } from "../types"

class ChatClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async createSession(userId: string, sessionId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/apps/${CONFIG.APP_NAME}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    )
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`)
    }
  }

  async getSessions(userId: string): Promise<Session[]> {
    const response = await fetch(
      `${this.baseUrl}/apps/${CONFIG.APP_NAME}/users/${encodeURIComponent(userId)}/sessions`,
      { headers: { "Content-Type": "application/json" } }
    )
    if (!response.ok) {
      throw new Error(`Failed to get sessions: ${response.status}`)
    }
    return response.json() as Promise<Session[]>
  }

  async getSessionHistory(userId: string, sessionId: string): Promise<Array<{ role: string; text: string; author?: string; timestamp?: string }>> {
    const response = await fetch(
      `${this.baseUrl}/apps/${CONFIG.APP_NAME}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/history`,
      { headers: { "Content-Type": "application/json" } }
    )
    if (!response.ok) {
      throw new Error(`Failed to get session history: ${response.status}`)
    }
    const data = await response.json() as { messages: Array<{ role: string; text: string; author?: string; timestamp?: string }> }
    return data.messages
  }

  async sendMessage(userId: string, sessionId: string, text: string): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/run_sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_name: CONFIG.APP_NAME,
        user_id: userId,
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [{ text }],
        },
      }),
    })
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }
    if (!response.body) {
      throw new Error("Response body is null")
    }
    return response.body
  }
}

export const chatClient = new ChatClient(CONFIG.BASE_URL)
