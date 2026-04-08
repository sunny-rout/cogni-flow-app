import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import Chat from './pages/Chat';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Events from './pages/Events';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
