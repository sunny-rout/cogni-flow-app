export interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  agent_name: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  location: string;
  created_at: string;
}

interface Storage {
  sessions: Session[];
  messages: Message[];
  tasks: Task[];
  notes: Note[];
  events: Event[];
}

const STORAGE_KEY = 'cogniflow_data';

function getStorage(): Storage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    sessions: [],
    messages: [],
    tasks: [],
    notes: [],
    events: [],
  };
}

function saveStorage(storage: Storage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export const storage = {
  sessions: {
    getAll: (userId: string): Session[] => {
      const data = getStorage();
      return data.sessions
        .filter((s) => s.user_id === userId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    getById: (id: string): Session | null => {
      const data = getStorage();
      return data.sessions.find((s) => s.id === id) || null;
    },
    create: (session: Session): Session => {
      const data = getStorage();
      data.sessions.push(session);
      saveStorage(data);
      return session;
    },
    update: (id: string, updates: Partial<Session>): Session | null => {
      const data = getStorage();
      const index = data.sessions.findIndex((s) => s.id === id);
      if (index === -1) return null;
      data.sessions[index] = { ...data.sessions[index], ...updates };
      saveStorage(data);
      return data.sessions[index];
    },
  },
  messages: {
    getBySession: (sessionId: string): Message[] => {
      const data = getStorage();
      return data.messages
        .filter((m) => m.session_id === sessionId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
    create: (message: Message): Message => {
      const data = getStorage();
      data.messages.push(message);
      saveStorage(data);
      return message;
    },
  },
  tasks: {
    getAll: (userId: string): Task[] => {
      const data = getStorage();
      return data.tasks
        .filter((t) => t.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    create: (task: Task): Task => {
      const data = getStorage();
      data.tasks.push(task);
      saveStorage(data);
      return task;
    },
    update: (id: string, updates: Partial<Task>): Task | null => {
      const data = getStorage();
      const index = data.tasks.findIndex((t) => t.id === id);
      if (index === -1) return null;
      data.tasks[index] = { ...data.tasks[index], ...updates };
      saveStorage(data);
      return data.tasks[index];
    },
    delete: (id: string): boolean => {
      const data = getStorage();
      const filtered = data.tasks.filter((t) => t.id !== id);
      if (filtered.length === data.tasks.length) return false;
      data.tasks = filtered;
      saveStorage(data);
      return true;
    },
  },
  notes: {
    getAll: (userId: string): Note[] => {
      const data = getStorage();
      return data.notes
        .filter((n) => n.user_id === userId)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    search: (userId: string, query: string): Note[] => {
      const data = getStorage();
      const lowerQuery = query.toLowerCase();
      return data.notes
        .filter((n) =>
          n.user_id === userId &&
          (n.title.toLowerCase().includes(lowerQuery) ||
           n.content.toLowerCase().includes(lowerQuery))
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    create: (note: Note): Note => {
      const data = getStorage();
      data.notes.push(note);
      saveStorage(data);
      return note;
    },
    update: (id: string, updates: Partial<Note>): Note | null => {
      const data = getStorage();
      const index = data.notes.findIndex((n) => n.id === id);
      if (index === -1) return null;
      data.notes[index] = { ...data.notes[index], ...updates };
      saveStorage(data);
      return data.notes[index];
    },
    delete: (id: string): boolean => {
      const data = getStorage();
      const filtered = data.notes.filter((n) => n.id !== id);
      if (filtered.length === data.notes.length) return false;
      data.notes = filtered;
      saveStorage(data);
      return true;
    },
  },
  events: {
    getAll: (userId: string): Event[] => {
      const data = getStorage();
      return data.events
        .filter((e) => e.user_id === userId)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    },
    create: (event: Event): Event => {
      const data = getStorage();
      data.events.push(event);
      saveStorage(data);
      return event;
    },
    update: (id: string, updates: Partial<Event>): Event | null => {
      const data = getStorage();
      const index = data.events.findIndex((e) => e.id === id);
      if (index === -1) return null;
      data.events[index] = { ...data.events[index], ...updates };
      saveStorage(data);
      return data.events[index];
    },
    delete: (id: string): boolean => {
      const data = getStorage();
      const filtered = data.events.filter((e) => e.id !== id);
      if (filtered.length === data.events.length) return false;
      data.events = filtered;
      saveStorage(data);
      return true;
    },
  },
};
