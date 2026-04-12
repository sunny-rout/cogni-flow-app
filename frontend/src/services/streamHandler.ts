import { sseParser } from "./sseParser"

interface StreamCallbacks {
  onToken: (text: string) => void
  onAuthor: (author: string) => void
  onComplete: (fullText: string) => void
  onError: (error: Error) => void
}

class StreamHandler {
  async handle(stream: ReadableStream, callbacks: StreamCallbacks): Promise<void> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let fullText = ""
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        const chunk = lines.join("\n")
        const events = sseParser.parse(chunk)

        for (const event of events) {
          if (sseParser.isTurnComplete(event)) {
            callbacks.onComplete(fullText)
            return
          }

          const author = sseParser.extractAuthor(event)
          callbacks.onAuthor(author)

          const text = sseParser.extractText(event)
          if (text) {
            fullText += text
            callbacks.onToken(text)
          }
        }
      }

      callbacks.onComplete(fullText)
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      reader.releaseLock()
    }
  }
}

export const streamHandler = new StreamHandler()
