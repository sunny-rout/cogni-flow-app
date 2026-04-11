import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider } from "./contexts/AppProvider"
import Chat from "./pages/Chat"
import Tasks from "./pages/Tasks"
import Notes from "./pages/Notes"
import Events from "./pages/Events"

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/events" element={<Events />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
