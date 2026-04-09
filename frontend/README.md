# CogniFlow Frontend

A React + TypeScript + Vite frontend for the CogniFlow multi-agent personal assistant application.

## Overview

CogniFlow is a multi-agent AI assistant that helps manage tasks, notes, events, and provides an interactive chat interface. The frontend communicates with a FastAPI backend that stores data in JSON files.

## Features

- **Chat Interface**: Interactive chat with multi-agent support and streaming responses (SSE)
- **Task Management**: Create, update, delete tasks with priorities and due dates
- **Notes**: Take and organize notes with tags and search functionality
- **Events/Schedule**: Manage calendar events with intelligent date parsing
- **REST API Integration**: Direct API calls to backend for CRUD operations

## Architecture

```
frontend/
├── src/
│   ├── api/
│   │   └── cogniflow.ts      # REST API calls to backend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx    # Main layout wrapper
│   │   │   ├── Navbar.tsx    # Top navigation
│   │   │   └── Sidebar.tsx   # Side navigation
│   │   └── Toast.tsx         # Toast notifications
│   ├── pages/
│   │   ├── Chat.tsx          # Chat interface with streaming
│   │   ├── Tasks.tsx         # Task management (REST API)
│   │   ├── Notes.tsx         # Note taking (REST API)
│   │   └── Events.tsx         # Event scheduling (REST API)
│   ├── lib/
│   │   ├── storage.ts         # localStorage for offline cache
│   │   └── messaging.ts       # Chat messaging helper
│   ├── contexts/
│   │   └── SessionContext.tsx # Session state management
│   └── hooks/
│       └── useToast.tsx       # Toast notification hook
└── dist/                     # Production build output
```

## Data Flow

### Chat Flow (Agent-based)

```
User Input → Chat.tsx
  ↓ (sendMessage)
POST /run_sse → Backend
  ↓ (Google ADK Runner)
Root Agent → Sub-Agent (task/schedule/notes)
  ↓ (storage tool)
JSON File (data/)
  ↓ (SSE stream)
Frontend displays streaming response
```

### Direct API Flow (CRUD Operations)

```
User Action (create/update/delete)
  ↓
Page Component (Tasks.tsx / Notes.tsx / Events.tsx)
  ↓
API Call (getTasks, createNote, etc.)
  ↓
GET/POST/PATCH/DELETE /api/{entity}
  ↓
FastAPI Endpoint
  ↓
storage/tools.py functions
  ↓
data/{entity}.json
  ↓
Frontend state updated
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  Chat.tsx   │ Tasks.tsx   │ Notes.tsx   │ Events.tsx            │
│  (SSE)      │ (REST API)  │ (REST API)  │ (REST API)            │
└──────┬──────┴──────┬──────┴──────┬──────┴───────────┬─────────────┘
       │             │             │                 │
       │             │             │                 │
       ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (cogniflow.ts)                     │
│  streamChat()  │  getTasks()  │  getNotes()  │  getEvents()    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Backend Server (server.py + FastAPI)             │
│                                                                  │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │  /run_sse    │     │        REST API Endpoints            │  │
│  │  (Streaming) │     │  GET/POST/PATCH/DELETE /api/tasks   │  │
│  └──────┬───────┘     │  GET/POST/PATCH/DELETE /api/notes    │  │
│         │             │  GET/POST/PATCH/DELETE /api/events   │  │
│         ▼             └───────────────────┬──────────────────┘  │
│  ┌────────────────────────────┐           │                     │
│  │    Google ADK Runner        │           │                     │
│  │                            │           ▼                     │
│  │  ┌──────────────────────┐  │  ┌─────────────────────────┐   │
│  │  │    Root Agent        │  │  │    Storage Layer        │   │
│  │  │  (Routes to sub-    │  │  │  (tools.py + store.py)  │   │
│  │  │   agents)            │  │  └────────────┬──────────┘   │
│  │  └──────────┬─────────┘  │               │               │
│  │             │            │               ▼               │
│  │  ┌──────────┼─────────┐  │  ┌─────────────────────────┐   │
│  │  │          │         │  │  │    JSON Files           │   │
│  │  ▼          ▼         ▼  │  │  tasks.json             │   │
│  │ task_     schedule_  notes │  │  notes.json            │   │
│  │ agent     _agent    _agent │  │  events.json           │   │
│  └──────────────┼─────────────┘  └─────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Google ADK     │
         │  (Gemini API)  │
         └─────────────────┘
```

## Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **Backend Server** running on port 8080

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8080
```

### 3. Start Backend

Ensure the backend server is running:

```bash
# From project root
python server.py
```

### 4. Start Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Implementation Details

### REST API Integration

The frontend uses direct REST API calls for CRUD operations on tasks, notes, and events:

```typescript
// Example: Fetching tasks
const tasks = await api.getTasks();

// Example: Creating a note
const note = await api.createNote("Title", "Content", "tag1,tag2");

// Example: Updating an event
await api.updateEvent(eventId, { title: "New Title" });
```

### API Functions (cogniflow.ts)

#### Tasks
- `getTasks(status?)` - List all tasks
- `getTask(id)` - Get single task
- `createTask(title, description, priority, dueDate)` - Create task
- `updateTask(id, fields)` - Update task fields
- `deleteTask(id)` - Delete task
- `searchTasks(keyword)` - Search tasks

#### Notes
- `getNotes()` - List all notes
- `getNote(id)` - Get single note
- `createNote(title, content, tags)` - Create note
- `updateNote(id, fields)` - Update note fields
- `deleteNote(id)` - Delete note
- `searchNotes(keyword)` - Search notes

#### Events
- `getEvents(fromDate?)` - List events
- `getEvent(id)` - Get single event
- `createEvent(title, startTime, endTime, description, location)` - Create event
- `updateEvent(id, fields)` - Update event fields
- `deleteEvent(id)` - Delete event
- `searchEvents(keyword)` - Search events

### Chat Streaming

Chat uses Server-Sent Events (SSE) for real-time streaming:

```typescript
await streamChat(request, (text) => {
  // Handle streaming text
}, (error) => {
  // Handle error
});
```

### Session Management

Sessions are managed through `SessionContext`:

```typescript
const { userId, sessionId } = useSession();
```

## Backend API Reference

### Health Check

```bash
curl http://localhost:8080/health
```

### Tasks API

```bash
# List all tasks
curl http://localhost:8080/api/tasks

# Create task
curl -X POST "http://localhost:8080/api/tasks?title=Test&priority=high"

# Update task
curl -X PATCH "http://localhost:8080/api/tasks/1?status=done"

# Delete task
curl -X DELETE http://localhost:8080/api/tasks/1
```

### Notes API

```bash
# List all notes
curl http://localhost:8080/api/notes

# Create note
curl -X POST "http://localhost:8080/api/notes?title=My Note&content=Content here&tags=work,idea"

# Delete note
curl -X DELETE http://localhost:8080/api/notes/1
```

### Events API

```bash
# List all events
curl http://localhost:8080/api/events

# Create event (with ISO datetime)
curl -X POST "http://localhost:8080/api/events?title=Meeting&start_time=2026-04-15T10:00:00&end_time=2026-04-15T11:00:00&location=Room 101"
```

### Chat API

```bash
# Streaming chat (SSE)
curl -X POST http://localhost:8080/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "multi_agent_app",
    "user_id": "user123",
    "session_id": "session456",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Create a task for tomorrow"}]
    }
  }'
```

## Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output is in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Static Hosting

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Google Cloud Storage

Set `VITE_BACKEND_URL` to your production backend URL in your hosting platform.

## Troubleshooting

### CORS Errors

Ensure your backend allows requests from your frontend URL in `server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://your-production-domain.com",
    ],
    ...
)
```

### API Connection Issues

1. Verify backend is running on port 8080
2. Check `VITE_BACKEND_URL` in `.env`
3. Test with: `curl http://localhost:8080/health`

### Network Inspection

Open browser DevTools → Network tab to inspect:
- API requests to `/api/*`
- SSE connections to `/run_sse`
- Response status codes

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Server-Sent Events (SSE)** - Real-time streaming
- **Fetch API** - HTTP client
