import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import Layout from "../components/layout/Layout"
import { useChat } from "../hooks/useChat"
import { useSession } from "../hooks/useSession"
import { getAgentColor } from "../utils"

export default function Chat() {
  const { messages, isStreaming, sendMessage } = useChat()
  const { userId, sessionId } = useSession()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isStreaming || !sessionId) return
    setInput("")
    sendMessage(userId, sessionId, text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Layout title="Chat">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
              <div className="text-5xl mb-4 opacity-40">⚡</div>
              <p className="text-slate-400 font-medium">Start a conversation with CogniFlow</p>
              <p className="text-slate-600 text-sm mt-1">Ask me to manage your tasks, notes, or events</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] ${msg.role === "user" ? "" : "space-y-1"}`}>
                {msg.role === "model" && msg.author && (
                  <div
                    className="text-xs font-medium px-1 mb-1"
                    style={{ color: getAgentColor(msg.author) }}
                  >
                    {msg.author.replace("_", " ")}
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-slate-700 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700"
                  }`}
                >
                  {msg.text}
                  {msg.isStreaming && msg.text.length === 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-800 px-4 py-4 bg-slate-950 flex-shrink-0">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: "48px", maxHeight: "160px" }}
              disabled={isStreaming || !sessionId}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim() || !sessionId}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
