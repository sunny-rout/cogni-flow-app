import type { SSEEvent } from "../types"

class SSEParser {
  parse(chunk: string): SSEEvent[] {
    return chunk
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter((data) => data.length > 0 && data !== "[DONE]")
      .flatMap((data) => {
        try {
          return [JSON.parse(data) as SSEEvent]
        } catch {
          return []
        }
      })
  }

  extractText(event: SSEEvent): string | null {
    return event.content?.parts?.[0]?.text ?? null
  }

  extractAuthor(event: SSEEvent): string {
    return event.author ?? "assistant"
  }

  isTurnComplete(event: SSEEvent): boolean {
    return event.turn_complete === true || event.turnComplete === true
  }
}

export const sseParser = new SSEParser()
