# CogniFlow Frontend

A React + TypeScript + Vite frontend for the CogniFlow multi-agent personal assistant application.

## Overview

CogniFlow is a multi-agent AI assistant that helps manage tasks, notes, events, and provides an interactive chat interface. The frontend uses localStorage for data persistence (JSON file storage), making it a lightweight prototype perfect for testing and development.

## Features

- **Chat Interface**: Interactive chat with multi-agent support and streaming responses
- **Task Management**: Create, update, and organize tasks with priorities and due dates
- **Notes**: Take and organize notes with tags and search functionality
- **Events/Schedule**: Manage calendar events with time and location
- **Local Storage**: All data persists in browser localStorage as JSON

## Architecture

### Storage System

The application uses a custom JSON storage utility (`src/lib/storage.ts`) that stores all data in localStorage:

```typescript
// Storage structure in localStorage
{
  sessions: Session[],
  messages: Message[],
  tasks: Task[],
  notes: Note[],
  events: Event[]
}
```

Data is stored under the key `cogniflow_data` and persists across browser sessions.

### Components Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── Navbar.tsx       # Top navigation
│   │   └── Sidebar.tsx      # Side navigation
│   └── Toast.tsx            # Toast notifications
├── pages/
│   ├── Chat.tsx             # Chat interface with streaming
│   ├── Tasks.tsx            # Task management
│   ├── Notes.tsx            # Note taking
│   └── Events.tsx           # Event scheduling
├── lib/
│   ├── storage.ts           # localStorage JSON storage utility
│   └── messaging.ts         # Backend communication helper
├── api/
│   └── cogniflow.ts         # API calls to backend
├── contexts/
│   └── SessionContext.tsx   # Session state management
└── hooks/
    └── useToast.tsx         # Toast notification hook
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8080
```

Replace with your backend URL when deployed.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Backend Integration

### Backend Requirements

The frontend expects a backend API with the following endpoints:

#### 1. Create Session (POST)
```
POST /create_session
Content-Type: application/json

{
  "user_id": "string",
  "session_id": "string"
}
```

#### 2. Stream Chat (POST - SSE)
```
POST /stream_chat
Content-Type: application/json

{
  "app_name": "multi_agent_app",
  "user_id": "string",
  "session_id": "string",
  "new_message": {
    "role": "user",
    "parts": [{ "text": "string" }]
  }
}
```

Response: Server-Sent Events (SSE) stream with text chunks

#### 3. Send Message (POST)
```
POST /send_message
Content-Type: application/json

{
  "user_id": "string",
  "session_id": "string",
  "message": "string"
}
```

### Testing Backend Integration

#### 1. Test Session Creation

```bash
curl -X POST http://localhost:8080/create_session \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "session_id": "test-session-123"}'
```

#### 2. Test Chat Streaming

```bash
curl -X POST http://localhost:8080/stream_chat \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "multi_agent_app",
    "user_id": "test-user",
    "session_id": "test-session-123",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Hello, create a task for testing"}]
    }
  }'
```

Expected response: SSE stream with chunks like:
```
data: [task_agent] Creating
data:  a new
data:  task...
```

#### 3. Test Message Sending

```bash
curl -X POST http://localhost:8080/send_message \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "session_id": "test-session-123",
    "message": "Create a note about testing"
  }'
```

### Connecting to Your Backend

1. **Local Development**:
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```

2. **Cloud Run Deployment**:
   ```env
   VITE_BACKEND_URL=https://your-service-xyz.run.app
   ```

3. **Testing Connection**:
   - Open browser console
   - Check Network tab for requests to backend
   - Look for SSE connections to `/stream_chat`
   - Verify 200 status codes and streaming responses

## Agent Detection

The chat interface detects which agent is responding by parsing the response text for patterns like:

```
[task_agent] Response text...
[notes_agent] Response text...
[schedule_agent] Response text...
```

This is displayed as a badge next to the agent's response in the chat UI.

## Data Flow

### Chat Message Flow
```
User Input → sendMessage() → Backend SSE Stream → Display Streaming Text → Save to localStorage
```

### Task/Note/Event Creation Flow
```
User Form → sendMessage() → Backend Processing → Create in localStorage → Refresh UI
```

## Storage API

### Sessions
```typescript
storage.sessions.getAll(userId)
storage.sessions.getById(id)
storage.sessions.create(session)
storage.sessions.update(id, updates)
```

### Messages
```typescript
storage.messages.getBySession(sessionId)
storage.messages.create(message)
```

### Tasks
```typescript
storage.tasks.getAll(userId)
storage.tasks.create(task)
storage.tasks.update(id, updates)
storage.tasks.delete(id)
```

### Notes
```typescript
storage.notes.getAll(userId)
storage.notes.search(userId, query)
storage.notes.create(note)
storage.notes.update(id, updates)
storage.notes.delete(id)
```

### Events
```typescript
storage.events.getAll(userId)
storage.events.create(event)
storage.events.update(id, updates)
storage.events.delete(id)
```

## Troubleshooting

### Backend Connection Issues

1. **CORS Errors**: Ensure your backend allows requests from `http://localhost:5173`
2. **Network Errors**: Check `VITE_BACKEND_URL` environment variable
3. **SSE Not Streaming**: Verify backend sends `Content-Type: text/event-stream`

### Storage Issues

1. **Data Not Persisting**: Check browser localStorage is enabled
2. **Clear All Data**: Open browser console and run:
   ```javascript
   localStorage.removeItem('cogniflow_data')
   ```

### Build Issues

1. **TypeScript Errors**: Run `npm run build` to see detailed errors
2. **Missing Dependencies**: Run `npm install` again
3. **Port Already in Use**: Change port in `vite.config.ts`

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Google Cloud Storage

### Environment Variables for Production

Set `VITE_BACKEND_URL` to your production backend URL in your hosting platform's environment settings.

## Development Tips

1. **Hot Reload**: Vite provides instant HMR for React components
2. **Debug Mode**: Open browser DevTools → Console for logs
3. **Network Inspection**: DevTools → Network tab to inspect backend calls
4. **Storage Inspection**: DevTools → Application → Local Storage to view data
5. **Clear Sessions**: Delete `cogniflow_session_id` and `cogniflow_user_id` from localStorage to reset

## Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Server-Sent Events**: Real-time streaming from backend
- **localStorage**: Client-side data persistence

## License

MIT
