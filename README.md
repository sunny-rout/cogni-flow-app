# CogniFlow

A multi-agent AI personal assistant that helps manage tasks, notes, events, and provides an interactive chat interface.

## Overview

CogniFlow uses Google ADK (Agent Development Kit) with specialized sub-agents for different domains. The backend stores data in JSON files, and the frontend provides both a chat interface and direct CRUD operations.

## Directory Structure

```
CogniFlow/
├── server.py                 # FastAPI server entry point
├── README.md                 # This file (integrated overview)
├── cogni_flow_app/          # Backend Python package
│   ├── README.md            # Backend documentation
│   ├── agent.py             # Root agent
│   ├── storage/             # JSON storage layer
│   ├── sub_agents/          # Specialized agents
│   └── data/                # JSON file storage
├── frontend/                 # React frontend
│   ├── README.md            # Frontend documentation
│   └── src/                 # React source
└── supabase/               # Database configuration (future)
```

## Quick Start

### Backend Setup

```bash
cd cogni_flow_app
uv pip install -r requirements.txt
```

Create `.env` file in `cogni_flow_app/`:

```env
MODEL=gemini-2.5-flash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
PORT=8080
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:8080
```

### Run

```bash
# Terminal 1 - Backend
python server.py

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## Architecture

<img src="images\AI-powered-architecture-diagram.png" alt="AI-powered-architecture-diagram">

## Data Flow

### Chat Flow (Agent-based)

```
User Input -> Chat.tsx
  | (sendMessage)
  v
POST /run_sse -> Backend
  | (Google ADK Runner)
  v
Root Agent -> Sub-Agent (task/schedule/notes)
  | (storage tool)
  v
JSON File (data/)
  | (SSE stream)
  v
Frontend displays streaming response
```

### Direct API Flow (CRUD Operations)

```
User Action (create/update/delete)
  |
  v
Page Component (Tasks.tsx / Notes.tsx / Events.tsx)
  |
  v
API Call (getTasks, createNote, etc.)
  |
  v
GET/POST/PATCH/DELETE /api/{entity}
  |
  v
FastAPI Endpoint -> storage/tools.py -> data/{entity}.json
```

## API Endpoints

### Health Check

```bash
curl http://localhost:8080/health
```

### Chat (SSE)

```bash
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

### REST API

| Entity | Endpoints |
|--------|-----------|
| Tasks | `GET/POST/PATCH/DELETE /api/tasks`, `GET /api/tasks/{id}`, `GET /api/tasks/search/{keyword}` |
| Notes | `GET/POST/PATCH/DELETE /api/notes`, `GET /api/notes/{id}`, `GET /api/notes/search/{keyword}` |
| Events | `GET/POST/PATCH/DELETE /api/events`, `GET /api/events/{id}`, `GET /api/events/search/{keyword}` |

## Natural Language Date Parsing

| Input | Output |
|-------|--------|
| `today`, `tomorrow`, `day after tomorrow` | Relative dates |
| `in 3 days`, `in 2 weeks` | Relative with offset |
| `next monday`, `April 15` | Day names & month dates |
| `3pm`, `9:30am`, `night`, `morning` | Time parsing |
| `for 1 hour`, `for 30 minutes` | Duration parsing |

## Detailed Documentation

For more details, see:

- **[Backend Documentation](./cogni_flow_app/README.md)** - Agent system, storage, API reference, setup, troubleshooting
- **[Frontend Documentation](./frontend/README.md)** - React components, API integration, build & deployment

## Tech Stack

### Backend
- **Google ADK** - Multi-agent framework
- **FastAPI** - Web framework
- **python-dateutil** - Natural language date parsing
- **Google Cloud Logging** - Logging

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Server-Sent Events** - Real-time streaming

## License

MIT
