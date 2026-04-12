import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { chatClient } from "../services/chatClient"
import { streamHandler } from "../services/streamHandler"
import { generateId } from "../utils"
import { useSession } from "./SessionContext"
import type { ChatMessage } from "../types"

interface ChatContextType {
  messages: ChatMessage[]
  isStreaming: boolean
  isLoadingHistory: boolean
  sendMessage: (userId: string, sessionId: string, text: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId, sessionId } = useSession()
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({})
  const [loadedSessions, setLoadedSessions] = useState<Set<string>>(new Set())
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const messages = messagesBySession[sessionId] ?? []

  useEffect(() => {
    if (!sessionId || !userId) return
    if (loadedSessions.has(sessionId)) return

    setLoadedSessions((prev) => new Set(prev).add(sessionId))
    setIsLoadingHistory(true)

    chatClient.getSessionHistory(userId, sessionId).then((history) => {
      if (history.length > 0) {
        const loaded: ChatMessage[] = history.map((m) => ({
          id: generateId(),
          role: m.role as "user" | "model",
          text: m.text,
          author: m.author,
          timestamp: m.timestamp ?? new Date().toISOString(),
        }))
        setMessagesBySession((prev) => ({ ...prev, [sessionId]: loaded }))
      }
    }).catch(() => {
    }).finally(() => {
      setIsLoadingHistory(false)
    })
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
    setMessages(sessionId, (prev) => [...prev, userMsg])

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "model",
      text: "",
      author: "assistant",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    setMessages(sessionId, (prev) => [...prev, assistantMsg])
    setIsStreaming(true)

    try {
      const stream = await chatClient.sendMessage(userId, sessionId, text)

      await streamHandler.handle(stream, {
        onToken: (token) => {
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
          setMessages(sessionId, (prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last && last.role === "model") {
              updated[updated.length - 1] = { ...last, isStreaming: false }
            }
            return updated
          })
          setIsStreaming(false)
        },
        onError: () => {
          setIsStreaming(false)
        },
      })
    } catch {
      setIsStreaming(false)
    }
  }

  return (
    <ChatContext.Provider value={{ messages, isStreaming, isLoadingHistory, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
