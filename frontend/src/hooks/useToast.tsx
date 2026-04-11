import { useState, useCallback } from "react"
import { generateId } from "../utils"
import type { ToastMessage } from "../types"

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastMessage["type"] = "info") => {
    const id = generateId()
    const toast: ToastMessage = { id, type, message }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, addToast, removeToast }
}
