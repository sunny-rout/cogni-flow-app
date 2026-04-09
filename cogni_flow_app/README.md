# CogniFlow Backend

A multi-agent AI assistant backend built with Google ADK (Agent Development Kit), FastAPI, and JSON file storage.

## Overview

CogniFlow Backend is a Python-based multi-agent system that handles:
- **Task Management** - Create, read, update, delete tasks
- **Note Taking** - Create, search, update, delete notes
- **Event Scheduling** - Create, list, update, delete calendar events

The system uses Google ADK's agent framework with specialized sub-agents for each domain, and stores data in JSON files.

## Architecture

```
cogni_flow_app/
├── agent.py                 # Root agent (routes to sub-agents)
├── storage/
│   ├── store.py            # JSON file read/write utilities
│   └── tools.py            # CRUD operations for all entities
├── sub_agents/
│   ├── task_agent.py       # Task management agent
│   ├── schedule_agent.py    # Event scheduling agent
│   └── notes_agent.py       # Note management agent
└── data/                    # JSON file storage
    ├── tasks.json
    ├── notes.json
    └── events.json
```

### Agent Flow

```
User Message → Root Agent → Routes to appropriate sub-agent:
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    task_agent         schedule_agent         notes_agent
         │                    │                    │
         ▼                    ▼                    ▼
  storage/tools.py    storage/tools.py       storage/tools.py
         │                    │                    │
         ▼                    ▼                    ▼
   tasks.json          events.json           notes.json
```

## Prerequisites

- **Python 3.10+**
- **Google Cloud Project** (for Vertex AI / Gemini API)
- **Service Account** with Vertex AI permissions
- **uv** (Python package manager)

### Required Services

1. **Vertex AI API** - Enabled in Google Cloud Console
2. **Service Account** - With roles:
   - `roles/aiplatform.user`
   - `roles/logging.logWriter`

## Setup

### 1. Install Dependencies

```bash
cd cogni_flow_app
uv pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in `cogni_flow_app/` directory:

```env
# Model configuration
MODEL=gemini-2.5-flash

# Google Cloud Project
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_GENAI_USE_VERTEXAI=1

# Service Account (path to JSON key file)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Server port (optional, defaults to 8080)
PORT=8080
```

### 3. Service Account Setup

1. Go to Google Cloud Console → IAM → Service Accounts
2. Create a new service account or use existing
3. Grant these roles:
   - **AI Platform User** (`roles/aiplatform.user`)
   - **Cloud Logging Writer** (`roles/logging.logWriter`)
4. Download the JSON key file
5. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of this file

### 4. Enable Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com
```

## Running the Server

### Development Mode

```bash
cd cogni_flow_app
uv pip install -r requirements.txt
python ../server.py
```

Or from project root:

```bash
uv pip install -r cogni_flow_app/requirements.txt
python server.py
```

### Production Mode

```bash
uvicorn server:app --host 0.0.0.0 --port 8080
```

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{"status": "healthy", "service": "cogniflow-api"}
```

### Multi-Agent Chat (SSE)

```
POST /run_sse
Content-Type: application/json

{
  "app_name": "multi_agent_app",
  "user_id": "user123",
  "session_id": "session456",
  "new_message": {
    "role": "user",
    "parts": [{"text": "Create a task for tomorrow"}]
  }
}
```

Response: Server-Sent Events stream

### Multi-Agent Chat (Non-Streaming)

```
POST /run
Content-Type: application/json

{
  "app_name": "multi_agent_app",
  "user_id": "user123",
  "session_id": "session456",
  "new_message": {
    "role": "user",
    "parts": [{"text": "Create a task for tomorrow"}]
  }
}
```

### REST API (Direct Access)

#### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks?status=pending` | List tasks by status |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks?title=...&description=...&priority=...&due_date=...` | Create task |
| PATCH | `/api/tasks/{id}?title=...&priority=...&status=...` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/search/{keyword}` | Search tasks |

#### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/{id}` | Get single note |
| POST | `/api/notes?title=...&content=...&tags=...` | Create note |
| PATCH | `/api/notes/{id}?title=...&content=...&tags=...` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| GET | `/api/notes/search/{keyword}` | Search notes |

#### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events?from_date=...` | List events from date |
| GET | `/api/events/{id}` | Get single event |
| POST | `/api/events?title=...&start_time=...&end_time=...&location=...` | Create event |
| PATCH | `/api/events/{id}?title=...&start_time=...` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/search/{keyword}` | Search events |

### Session Management

```
POST /apps/{app_name}/users/{user_id}/sessions/{session_id}
GET  /apps/{app_name}/users/{user_id}/sessions
```

## Natural Language Date Parsing

The schedule agent supports natural language date/time:

### Date Examples

| Input | Output |
|-------|--------|
| `today` | Current date |
| `tomorrow` | Next day |
| `day after tomorrow` | 2 days from now |
| `in 3 days` | 3 days from now |
| `in 2 weeks` | 2 weeks from now |
| `next monday` | Next Monday |
| `April 15` | April 15 (current year) |
| `April 15, 2026` | April 15, 2026 |

### Time Examples

| Input | Output |
|-------|--------|
| `3pm` / `at 3pm` | 15:00:00 |
| `9:30am` | 09:30:00 |
| `noon` / `midday` | 12:00:00 |
| `midnight` | 00:00:00 |
| `night` | 21:00:00 |
| `morning` | 09:00:00 |
| `afternoon` | 14:00:00 |
| `evening` | 18:00:00 |

### Duration Examples

| Input | Effect |
|-------|--------|
| `for 1 hour` | End time = start + 1 hour |
| `for 30 minutes` | End time = start + 30 minutes |

## Data Flow

### 1. Agent Routing Flow

```
User: "Create a task for tomorrow"
  ↓
Root Agent (agent.py)
  ↓ (classifies intent)
task_agent
  ↓ (calls smart_create_event tool)
smart_create_event (schedule_agent.py)
  ↓ (parses "tomorrow" using python-dateutil)
create_event (storage/tools.py)
  ↓
tasks.json
```

### 2. API Request Flow

```
Frontend → POST /run_sse
  ↓
FastAPI (server.py)
  ↓
Runner (Google ADK)
  ↓
Root Agent → Sub-Agent
  ↓
Storage Tool
  ↓
JSON File
```

### 3. Direct API Flow (REST)

```
Frontend → GET /api/tasks
  ↓
FastAPI endpoint
  ↓
storage/tools.list_tasks()
  ↓
store._read("tasks")
  ↓
tasks.json
```

## Storage Structure

### tasks.json

```json
[
  {
    "id": 1,
    "title": "Build login page",
    "description": "Implement OAuth2 login",
    "priority": "high",
    "due_date": "2026-04-15",
    "status": "pending",
    "created_at": "2026-04-08T21:50:23.645974",
    "updated_at": "2026-04-08T21:50:23.645986"
  }
]
```

### notes.json

```json
[
  {
    "id": 1,
    "title": "Meeting Notes",
    "content": "Discussed project timeline...",
    "tags": ["work", "meeting"],
    "created_at": "2026-04-08T21:50:23.645974",
    "updated_at": "2026-04-08T21:50:23.645986"
  }
]
```

### events.json

```json
[
  {
    "id": 1,
    "title": "Team Standup",
    "description": "Daily standup meeting",
    "start_time": "2026-04-09T09:00:00",
    "end_time": "2026-04-09T09:30:00",
    "location": "Google Meet",
    "created_at": "2026-04-09T11:44:52.166399"
  }
]
```

## Process Flow

### 1. Server Startup

```
server.py starts
  ↓
Load environment variables
  ↓
Initialize Google Cloud Logging
  ↓
Import root_agent (loads sub-agents)
  ↓
Create FastAPI app with CORS middleware
  ↓
Start uvicorn server on PORT 8080
```

### 2. Chat Request Processing

```
1. User sends message via POST /run_sse
2. FastAPI receives ChatRequest
3. Create or get existing session
4. Runner.run_async() processes message
5. Root agent classifies intent
6. Routes to appropriate sub-agent
7. Sub-agent calls storage tool function
8. Storage tool reads/writes JSON file
9. Response flows back through runner
10. SSE stream sends response to frontend
```

### 3. Direct API Request Processing

```
1. Frontend calls GET /api/tasks
2. FastAPI route handler called
3. Calls list_tasks() from storage/tools.py
4. Reads from tasks.json via store._read()
5. Returns JSON response to frontend
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| google-adk | latest | Agent framework |
| fastapi | latest | Web framework |
| uvicorn | latest | ASGI server |
| google-cloud-logging | latest | Cloud logging |
| python-dateutil | latest | Date parsing |
| python-dotenv | latest | Environment config |
| pydantic | latest | Data validation |
| sse-starlette | latest | SSE support |

## CORS Configuration

The server allows CORS requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

To add more origins, edit `server.py`:

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

## Error Handling

All endpoints return appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

Error responses include a JSON body:

```json
{"detail": "Error description"}
```

## Development

### Adding New Sub-Agents

1. Create new file in `sub_agents/`:
```python
# sub_agents/custom_agent.py
from google.adk.agents import Agent

custom_agent = Agent(
    name="custom_agent",
    model=os.getenv("MODEL", "gemini-2.5-flash"),
    description="Description of what it does",
    instruction="Instructions for the agent...",
    tools=[...],
)
```

2. Import and add to root_agent in `agent.py`:
```python
from .sub_agents.custom_agent import custom_agent

root_agent = Agent(
    ...
    sub_agents=[task_agent, schedule_agent, notes_agent, custom_agent],
)
```

### Adding New Storage Functions

1. Add functions to `storage/tools.py`:
```python
def create_custom(title: str, ...) -> dict:
    data = _read("custom")
    item = {...}
    data.append(item)
    _write("custom", data)
    return item
```

2. Import and use in your agent's tools list.

## Troubleshooting

### Import Errors

If you see `ModuleNotFoundError`:
```bash
uv pip install -r requirements.txt
```

### Google Auth Errors

1. Verify `GOOGLE_APPLICATION_CREDENTIALS` path
2. Check service account has required roles
3. Ensure Vertex AI API is enabled

### CORS Errors

Check that frontend URL is in `allow_origins` list

### JSON Parse Errors

Check that JSON files in `data/` are valid:
```bash
python -c "import json; json.load(open('data/tasks.json'))"
```