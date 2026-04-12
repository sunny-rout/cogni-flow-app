import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { chatClient } from "../services/chatClient"
import { streamHandler } from "../services/streamHandler"
import { generateId } from "../utils"
import { useSession } from "./SessionContext"
import { storage } from "../lib/storage"
import type { ChatMessage } from "../types"

interface ChatContextType {
  messages: ChatMessage[]
  isStreaming: boolean
  sendMessage: (userId: string, sessionId: string, text: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId, sessionId } = useSession()
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({})
  const [isStreaming, setIsStreaming] = useState(false)
  const initializedSessions = useRef<Set<string>>(new Set())

  const messages = messagesBySession[sessionId] ?? []

  useEffect(() => {
    if (!sessionId || !userId) return
    if (initializedSessions.current.has(sessionId)) return
    initializedSessions.current.add(sessionId)

    const stored = storage.messages.getBySession(sessionId)
    if (stored.length > 0) {
      const loaded: ChatMessage[] = stored.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.content,
        author: m.agent_name ?? undefined,
        timestamp: m.created_at,
      }))
      setMessagesBySession((prev) => ({ ...prev, [sessionId]: loaded }))
    }
  }, [sessionId, userId])

  const setMessages = (sessionKey: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessagesBySession((allSessions) => ({
      ...allSessions,
      [sessionKey]: updater(allSessions[sessionKey] ?? []),
    }))
  }

  const sendMessage = async (userId: string, sessionId: string, text: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    }
    storage.messages.create({ id: userMsg.id, session_id: sessionId, role: "user", content: text, agent_name: null, created_at: userMsg.timestamp })
    storage.sessions.update(sessionId, { updated_at: userMsg.timestamp })
    setMessages(sessionId, (prev) => [...prev, userMsg])

    const assistantMsgId = generateId()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "model",
      text: "",
      author: "assistant",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    setMessages(sessionId, (prev) => [...prev, assistantMsg])
    setIsStreaming(true)

    let finalText = ""
    let finalAuthor = "assistant"

    const clearStreaming = (fallbackText?: string) => {
      setMessages(sessionId, (prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === "model") {
          updated[updated.length - 1] = {
            ...last,
            isStreaming: false,
            text: last.text || fallbackText || "",
          }
        }
        return updated
      })
      setIsStreaming(false)
    }

    try {
      const stream = await chatClient.sendMessage(userId, sessionId, text)

      await streamHandler.handle(stream, {
        onToken: (token) => {
          finalText += token
          setMessages(sessionId, (prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last && last.role === "model") {
              updated[updated.length - 1] = { ...last, text: last.text + token }
            }
            return updated
          })
        },
        onAuthor: (author) => {
          finalAuthor = author
          setMessages(sessionId, (prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last && last.role === "model") {
              updated[updated.length - 1] = { ...last, author }
            }
            return updated
          })
        },
        onComplete: () => {
          clearStreaming()
          const now = new Date().toISOString()
          storage.messages.create({ id: assistantMsgId, session_id: sessionId, role: "model", content: finalText, agent_name: finalAuthor, created_at: now })
          storage.sessions.update(sessionId, { updated_at: now })
        },
        onError: () => {
          clearStreaming("Something went wrong. Please try again.")
        },
      })
    } catch {
      clearStreaming("Something went wrong. Please try again.")
    }
  }

  return (
    <ChatContext.Provider value={{ messages, isStreaming, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
