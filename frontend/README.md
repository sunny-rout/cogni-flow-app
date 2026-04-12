# CogniFlow — Frontend Reference

React + TypeScript + Vite frontend for CogniFlow. Communicates with the FastAPI backend via REST and SSE streaming.

---

## Setup

### Prerequisites

- Node.js 18+
- CogniFlow backend running on port 8080

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.

### Build

```bash
npm run build    # outputs to dist/
npm run preview  # serves the production build locally
```

### Environment Variables

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_APP_NAME=cogni_flow_app
```

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8080` | Backend base URL |
| `VITE_APP_NAME` | `cogni_flow_app` | ADK app name — must match the backend `app_name` |

Both variables are read from `src/config/env.ts` and frozen into the `CONFIG` object at startup. Never reference `import.meta.env` directly in components; always import from `CONFIG`.

---

## Project Structure

```
src/
├── config/
│   └── env.ts               # CONFIG singleton (BASE_URL, APP_NAME, DEFAULT_USER_ID)
├── constants/
│   └── index.ts             # PRIORITY_COLORS, STATUS_COLORS, AGENT_COLORS, label maps
├── types/
│   └── index.ts             # Task, Note, Event, ChatMessage, Session, ApiResponse<T>, etc.
├── utils/
│   └── index.ts             # formatDate, formatDateTime, truncateText, parseTagsFromString
│
├── services/
│   ├── restClient.ts        # Typed REST client (tasks, notes, events)
│   ├── chatClient.ts        # Session management + /run_sse streaming
│   ├── sseParser.ts         # SSE chunk → SSEEvent[]
│   ├── streamHandler.ts     # ReadableStream → token callbacks
│   └── sessionService.ts    # In-memory session store
│
├── api/
│   └── cogniflow.ts         # High-level API helpers (thin wrappers over service clients)
│
├── contexts/
│   ├── AppProvider.tsx      # Root provider: composes all contexts
│   ├── SessionContext.tsx
│   ├── ChatContext.tsx
│   ├── TaskContext.tsx
│   ├── NotesContext.tsx
│   └── EventsContext.tsx
│
├── hooks/
│   ├── useSession.ts
│   ├── useChat.ts
│   ├── useTasks.ts
│   ├── useNotes.ts
│   ├── useEvents.ts
│   └── useToast.tsx
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx       # Desktop sidebar + mobile navbar/tabs + ToastContainer
│   │   ├── Navbar.tsx       # Page title + mobile hamburger
│   │   └── Sidebar.tsx      # Logo, nav links, session list, new session button
│   └── ui/
│       ├── Button.tsx       # primary / secondary / ghost / danger; sm / md / lg; loading state
│       ├── Input.tsx        # Labeled text input with optional error
│       ├── Textarea.tsx     # Labeled multi-line input
│       ├── Select.tsx       # Labeled dropdown from {value, label}[] options
│       ├── Modal.tsx        # Overlay with ESC + backdrop-click dismiss
│       ├── Badge.tsx        # Colored pill (uses STATUS_COLORS / PRIORITY_COLORS)
│       ├── Card.tsx         # Surface card with optional left accent stripe
│       ├── Skeleton.tsx     # Shimmer placeholder (configurable width/height)
│       ├── EmptyState.tsx   # Icon + title + message + optional action button
│       ├── Spinner.tsx      # Animated circle (sm / md / lg)
│       ├── Toast.tsx        # Auto-dismissing notification (success / error / info)
│       └── ToastContainer.tsx  # Fixed top-right stack of active toasts
│
└── pages/
    ├── Chat.tsx             # SSE streaming chat, agent badges, typing indicator
    ├── Tasks.tsx            # Filter tabs, search, priority cards, CRUD modal
    ├── Notes.tsx            # 2-column grid, tag badges, search, CRUD modal
    └── Events.tsx           # Upcoming / all filter, datetime display, CRUD modal
```

---

## TypeScript Types

All types are in `src/types/index.ts` and mirror the backend Pydantic models directly.

```typescript
interface Task {
  id:          number;
  title:       string;
  description: string;
  priority:    'low' | 'medium' | 'high';
  status:      'pending' | 'in_progress' | 'done';
  due_date:    string | null;   // YYYY-MM-DD
  created_at:  string;
  updated_at:  string;
}

interface Note {
  id:         number;
  title:      string;
  content:    string;
  tags:       string[];
  created_at: string;
  updated_at: string;
}

interface Event {
  id:          number;
  title:       string;
  description: string;
  start_time:  string;   // YYYY-MM-DDTHH:MM:SS
  end_time:    string;   // YYYY-MM-DDTHH:MM:SS
  location:    string;
  created_at:  string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data:    T | null;
  error:   string | null;
  message: string | null;
}

interface ChatMessage {
  id:          string;
  role:        'user' | 'model';
  text:        string;
  author?:     string;
  timestamp:   string;
  isStreaming?: boolean;
}

interface Session {
  id:        string;
  createdAt: string;
}

interface SSEEvent {
  content?:      { parts: { text: string }[] };
  author?:       string;
  turn_complete?: boolean;
  turnComplete?:  boolean;
  partial?:       boolean;
}
```

---

## Connecting to the REST API

All REST calls go through `restClient` (`src/services/restClient.ts`), which is a singleton initialized with `CONFIG.BASE_URL`.

### Pattern

```typescript
import { restClient } from '../services/restClient';

const tasks = await restClient.getTasks();
```

**Always check `success` before using `data`:**

```typescript
const { data, success, error } = await restClient.getTasks();
if (!success) {
  console.error(error);
  return;
}
// safe to use data here
```

The `restClient` internally extracts `response.data` from the `ApiResponse<T>` envelope so callers receive typed arrays or objects directly — but any failed call throws or returns an empty result depending on how it is consumed.

### Available Methods

**Tasks:**

```typescript
restClient.getTasks(status?: 'pending' | 'in_progress' | 'done')  → Task[]
restClient.getTask(id: number)                                      → Task
restClient.createTask(title, description, priority, dueDate?)       → Task
restClient.updateTask(id, fields: Partial<Task>)                    → Task
restClient.deleteTask(id)                                           → void
restClient.searchTasks(keyword)                                     → Task[]
```

**Notes:**

```typescript
restClient.getNotes()                                               → Note[]
restClient.getNote(id)                                              → Note
restClient.createNote(title, content, tags)                         → Note
restClient.updateNote(id, fields: Partial<Note>)                    → Note
restClient.deleteNote(id)                                           → void
restClient.searchNotes(keyword)                                     → Note[]
```

**Events:**

```typescript
restClient.getEvents()                                              → Event[]
restClient.getEvent(id)                                             → Event
restClient.createEvent(title, startTime, endTime, desc?, location?) → Event
restClient.updateEvent(id, fields: Partial<Event>)                  → Event
restClient.deleteEvent(id)                                          → void
restClient.searchEvents(keyword)                                    → Event[]
```

---

## SSE Chat Streaming

### Prerequisites

A session must be created before sending any chat message. The `SessionContext` handles this automatically when a new session is started via the sidebar.

```typescript
import { chatClient } from '../services/chatClient';

await chatClient.createSession(userId, sessionId);
```

### Sending a Message

```typescript
const stream: ReadableStream = await chatClient.sendMessage(userId, sessionId, text);
```

This calls `POST /run_sse` with:

```json
{
  "app_name":   "cogni_flow_app",
  "user_id":    "user_03011315",
  "session_id": "<uuid>",
  "new_message": {
    "role":  "user",
    "parts": [{ "text": "..." }]
  }
}
```

### Processing the Stream

Pass the `ReadableStream` to `streamHandler`:

```typescript
import { streamHandler } from '../services/streamHandler';

await streamHandler.handle(stream, {
  onToken:    (text)     => appendToCurrentMessage(text),
  onAuthor:   (author)   => setCurrentAgent(author),
  onComplete: (fullText) => finaliseMessage(fullText),
  onError:    (err)      => showErrorToast(err.message),
});
```

`streamHandler` delegates chunk parsing to `sseParser`, which:

1. Splits raw chunks by newline
2. Strips the `data:` prefix
3. Skips `[DONE]`
4. Parses JSON into `SSEEvent` objects
5. Extracts `event.content.parts[0].text` as the token text
6. Detects `turn_complete: true` to signal stream end

---

## CORS

The backend reads allowed origins from the `ALLOWED_ORIGINS` environment variable. Defaults include ports `5173` and `5174`.

To allow a different dev port (e.g. `5175`), add it to `ALLOWED_ORIGINS` in the backend `.env`:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

No frontend changes are needed.

---

## Data Flow Summary

### CRUD pages (Tasks / Notes / Events)

```
User action
  → hook (useTasks / useNotes / useEvents)
  → restClient method
  → GET / POST / PATCH / DELETE /api/{entity}
  → context state updated
  → page re-renders
  → useToast.addToast() → ToastContainer
```

### Chat (SSE streaming)

```
User submits message
  → ChatContext.sendMessage()
  → chatClient.sendMessage() → POST /run_sse
  → streamHandler.handle()
  → sseParser.parse() per chunk
  → onToken callback → append to message in context
  → onComplete callback → mark message as finished
  → Chat.tsx re-renders on each token
```

The Events page fetches all events once on load. The "Upcoming" / "All" filter tabs and date-sorting are handled entirely in the frontend using in-memory state — no additional API calls are made when switching tabs.
