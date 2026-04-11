import type { ReactNode } from "react"
import { SessionProvider } from "./SessionContext"
import { ChatProvider } from "./ChatContext"
import { TaskProvider } from "./TaskContext"
import { NotesProvider } from "./NotesContext"
import { EventsProvider } from "./EventsContext"

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>
        <TaskProvider>
          <NotesProvider>
            <EventsProvider>
              {children}
            </EventsProvider>
          </NotesProvider>
        </TaskProvider>
      </ChatProvider>
    </SessionProvider>
  )
}
