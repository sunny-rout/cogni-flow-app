# CogniFlow Frontend

A React + TypeScript + Vite frontend for the CogniFlow multi-agent personal assistant application.

## Overview

CogniFlow is a multi-agent AI assistant that helps manage tasks, notes, events, and provides an interactive chat interface. The frontend communicates with a FastAPI backend and is structured in five distinct layers, from design tokens up to full pages.

## Features

- **Chat Interface**: Interactive chat with multi-agent support and live SSE streaming responses
- **Task Management**: Create, update, delete tasks with priorities, statuses, due dates, and filters
- **Notes**: Take and organize notes with tags, content previews, and search
- **Events**: Schedule and manage calendar events with upcoming/all filtering
- **Toast Notifications**: Success, error, and info toasts on every action
- **Responsive Layout**: Desktop sidebar + main content; mobile top navbar + bottom tab navigation
- **Skeleton Loading**: Shimmer placeholders on every page while data loads
- **Empty States**: Contextual empty state UI when no data exists

## Architecture

The codebase is organized into five layers:

### Layer 1 — Design Tokens (`src/constants/index.ts`)
- Color palettes for priorities (`PRIORITY_COLORS`), statuses (`STATUS_COLORS`), and agents (`AGENT_COLORS`)
- Human-readable label maps (`PRIORITY_LABELS`, `STATUS_LABELS`)

### Layer 2 — Types & Utilities (`src/types/`, `src/utils/`)
- Shared TypeScript interfaces: `Task`, `Note`, `Event`, `ChatMessage`, `Session`, `ToastMessage`
- Utility functions: `formatDate`, `formatDateTime`, `truncateText`, `parseTagsFromString`, `getAgentColor`

### Layer 3 — Services & Contexts (`src/services/`, `src/contexts/`, `src/hooks/`)
- `restClient` — typed REST API client for tasks, notes, and events
- `chatClient` — session creation and SSE message streaming
- `streamHandler` / `sseParser` — live token parsing from SSE streams
- Contexts: `SessionContext`, `ChatContext`, `TaskContext`, `NotesContext`, `EventsContext`
- `AppProvider` — single root provider that composes all contexts
- Hooks: `useSession`, `useChat`, `useTasks`, `useNotes`, `useEvents`, `useToast`

### Layer 4 — UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `Button` | `primary / secondary / ghost / danger` variants, `sm / md / lg` sizes, loading state |
| `Input` | Labeled text input with optional error message |
| `Textarea` | Labeled multi-line input |
| `Select` | Labeled dropdown from `{value, label}[]` options |
| `Modal` | Overlay with ESC + backdrop-click close |
| `Badge` | Colored pill label (uses `STATUS_COLORS` / `PRIORITY_COLORS`) |
| `Card` | Surface card with optional left accent stripe |
| `Skeleton` | Shimmer placeholder with configurable width/height |
| `EmptyState` | Icon + title + message + optional action button |
| `Toast` | Auto-dismissing notification (success/error/info) |
| `ToastContainer` | Top-right fixed stack of active toasts |
| `Spinner` | Animated loading circle (`sm / md / lg`) |

### Layer 5 — Layout & Pages

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx    # Desktop sidebar + mobile navbar/tabs + ToastContainer
│   │   ├── Navbar.tsx    # Page title + mobile hamburger toggle
│   │   └── Sidebar.tsx   # Logo, nav links, sessions list, new session button
│   └── ui/               # (see Layer 4 above)
└── pages/
    ├── Chat.tsx          # SSE streaming chat, agent badges, typing indicator
    ├── Tasks.tsx         # Filter tabs, search, priority cards, CRUD modal
    ├── Notes.tsx         # 2-column grid, tag badges, search, CRUD modal
    └── Events.tsx        # Upcoming/all filter, datetime display, CRUD modal
```

## Data Flow

### Chat (SSE streaming)

```
User Input → Chat.tsx
  → chatClient.sendMessage() → POST /run_sse
  → streamHandler.handle() → sseParser.parse()
  → onToken callbacks → ChatContext.messages (live append)
  → Chat.tsx re-renders each token
```

### CRUD Pages (Tasks / Notes / Events)

```
User Action → Page Component
  → Hook (useTasks / useNotes / useEvents)
  → restClient method (GET / POST / PATCH / DELETE)
  → /api/{entity} backend endpoint
  → Context state updated → Page re-renders
  → useToast.addToast() → ToastContainer renders notification
```

### Architecture Diagram

<img src="..\images\AI-powered-architecture-diagram.png" alt="AI-powered-architecture-diagram">

## Prerequisites

- **Node.js 18+**
- **npm**
- **Backend Server** running on port 8080

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

The `frontend/.env.local` file should contain:

```env
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Start Backend

```bash
# From project root
python server.py
```

### 4. Start Frontend Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build & Deployment

### Production Build

```bash
npm run build
```

Output is in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Static Hosting

The `dist/` folder can be deployed to Vercel, Netlify, GitHub Pages, Firebase Hosting, AWS S3 + CloudFront, or Google Cloud Storage. Set `VITE_BACKEND_URL` to your production backend URL in your hosting platform environment.

## Backend API Reference

### Health Check

```bash
curl http://localhost:8080/health
```

### Tasks API

```bash
# List all tasks
curl http://localhost:8080/api/tasks

# Filter by status
curl "http://localhost:8080/api/tasks?status=pending"

# Create task
curl -X POST "http://localhost:8080/api/tasks?title=Test&priority=high&description=Details"

# Update task
curl -X PATCH "http://localhost:8080/api/tasks/1?status=done"

# Delete task
curl -X DELETE http://localhost:8080/api/tasks/1

# Search
curl http://localhost:8080/api/tasks/search/keyword
```

### Notes API

```bash
# List all notes
curl http://localhost:8080/api/notes

# Create note
curl -X POST "http://localhost:8080/api/notes?title=My+Note&content=Content&tags=work,idea"

# Update note
curl -X PATCH "http://localhost:8080/api/notes/1?title=Updated+Title"

# Delete note
curl -X DELETE http://localhost:8080/api/notes/1
```

### Events API

```bash
# List all events
curl http://localhost:8080/api/events

# Upcoming only
curl "http://localhost:8080/api/events?from_date=2026-04-11T00:00:00"

# Create event
curl -X POST "http://localhost:8080/api/events?title=Meeting&start_time=2026-04-15T10:00:00&end_time=2026-04-15T11:00:00&location=Room+101"

# Delete event
curl -X DELETE http://localhost:8080/api/events/1
```

### Chat API (SSE)

```bash
curl -X POST http://localhost:8080/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "multi_agent_app",
    "user_id": "user",
    "session_id": "my-session-id",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Create a task for tomorrow"}]
    }
  }'
```

## Troubleshooting

### CORS Errors

Ensure the backend allows requests from your frontend origin in `server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    ...
)
```

### API Connection Issues

1. Verify backend is running: `curl http://localhost:8080/health`
2. Check `VITE_BACKEND_URL` in `frontend/.env.local`

### Network Inspection

Open browser DevTools → Network tab to inspect:
- API requests to `/api/*`
- SSE connections to `/run_sse`
- Session management calls to `/apps/*/users/*/sessions`

## Tech Stack

- **React 19** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first styling (dark theme, 8px spacing system)
- **React Router v7** — Client-side routing
- **Server-Sent Events (SSE)** — Real-time chat streaming
- **Fetch API** — HTTP client (no extra dependencies)
