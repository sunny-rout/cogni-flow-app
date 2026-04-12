# CogniFlow — Backend Reference

FastAPI backend for CogniFlow. Exposes REST endpoints and an SSE chat endpoint powered by a multi-agent system built on Google ADK and Vertex AI.

---

## Architecture — 5-Layer Stack

```
Request
   │
   ▼
Routers          ← HTTP boundary: request parsing, response wrapping, HTTP errors
   │
   ▼
Services         ← Business logic, @log_operation decoration
   │
   ▼
Repositories     ← Persistence abstraction (BaseRepository[T])
   │
   ▼
Storage          ← JSON file I/O (swappable: replace only this layer for a new DB)
   │
   ▼
Models           ← Pydantic v2 data contracts (Task, Note, Event, ApiResponse[T])
```

AI (chat) path:

```
POST /run_sse
   │
   ▼
Google ADK Runner
   │
   ▼
Root Agent  ──routes──►  task_agent | notes_agent | schedule_agent
                               │
                               ▼
                         Tool functions  ──►  Storage layer
                               │
                               ▼
                         SSE stream back to client
```

---

## Project Structure

```
cogni_flow_app/
├── agent.py                     # Root agent, sub-agent wiring, timezone (Asia/Kolkata)
├── config.py                    # AppConfig frozen dataclass, `config` singleton
├── constants.py                 # VALID_PRIORITIES, VALID_STATUSES, DATE_FORMAT, TIME_DEFAULTS
│
├── models/
│   ├── task.py                  # Task
│   ├── note.py                  # Note
│   ├── event.py                 # Event
│   ├── requests/                # CreateTaskRequest, UpdateTaskRequest, etc.
│   └── responses/
│       ├── base_response.py     # ApiResponse[T]  ← universal envelope
│       ├── task_responses.py    # TaskResponse, TaskListResponse
│       ├── note_responses.py    # NoteResponse, NoteListResponse
│       ├── event_responses.py   # EventResponse, EventListResponse
│       └── common_responses.py  # DeleteResponse, HealthResponse, SessionResponse
│
├── repositories/
│   ├── base.py                  # BaseRepository[T] (abstract)
│   └── json/
│       ├── base_json_repo.py    # BaseJsonRepository[T] — generic JSON implementation
│       ├── task_repo.py         # TaskRepository
│       ├── note_repo.py         # NoteRepository
│       ├── event_repo.py        # EventRepository
│       └── store.py             # JsonFileStore (file I/O)
│
├── services/
│   ├── base.py                  # BaseService[T] (get_all, get_by_id, delete, search)
│   ├── task_service.py          # TaskService (create, update, filter by status)
│   ├── note_service.py          # NoteService (create, update)
│   └── event_service.py         # EventService (create, update, upcoming)
│
├── tools/
│   ├── task_tools.py            # AI-callable task functions
│   ├── note_tools.py            # AI-callable note functions
│   └── event_tools.py           # AI-callable event functions
│
├── sub_agents/
│   ├── task_agent.py            # task_agent (ADK LlmAgent)
│   ├── notes_agent.py           # notes_agent
│   └── schedule_agent.py        # schedule_agent
│
├── routers/
│   ├── base_router.py           # create_crud_router() factory
│   ├── task_router.py           # /api/tasks
│   ├── note_router.py           # /api/notes
│   └── event_router.py          # /api/events
│
├── logging/
│   ├── logger.py                # get_logger(), JsonFormatter, DevFormatter
│   ├── decorators.py            # @log_operation
│   └── middleware.py            # RequestLoggingMiddleware
│
└── storage/
    ├── store.py                 # _read/_write/_path/next_id (raw file ops)
    └── tools.py                 # Flat tool functions used directly by AI tools
```

---

## Setup

```bash
uv venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
uv pip install -r cogni_flow_app/requirements.txt
```

Create `.env` in the project root (parent of `cogni_flow_app/`):

```env
MODEL=gemini-2.5-flash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

```bash
python server.py
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MODEL` | `gemini-2.5-flash` | Gemini model identifier |
| `GOOGLE_CLOUD_PROJECT` | — | GCP project ID (required for Vertex AI) |
| `GOOGLE_GENAI_USE_VERTEXAI` | `1` | `1` = Vertex AI, `0` = AI Studio |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Service account JSON path |
| `PORT` | `8080` | Uvicorn port |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated CORS origins |

---

## API Response Shape

Every endpoint wraps its payload in `ApiResponse[T]`:

```python
class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data:    Optional[T]    = None
    error:   Optional[str]  = None
    message: Optional[str]  = None
```

Constructors:

```python
ApiResponse.ok(data, message=None)   # success=True
ApiResponse.fail(error)              # success=False, data=None
```

Always check `success` before reading `data`. A `200 OK` HTTP status does not guarantee success — validation errors return `success: false` with HTTP 200.

---

## REST Endpoints

### Health

```
GET  /health
```

Returns `{ "status": "healthy", "service": "cogniflow-api" }`.

### Session Management

A session must exist before calling `/run_sse`.

```
POST /apps/{app_name}/users/{user_id}/sessions/{session_id}
GET  /apps/{app_name}/users/{user_id}/sessions
```

### Chat — SSE Streaming

```
POST /run_sse
Content-Type: application/json

{
  "app_name": "cogni_flow_app",
  "user_id":  "user_03011315",
  "session_id": "<uuid>",
  "new_message": {
    "role": "user",
    "parts": [{ "text": "Create a task: Review PR by tomorrow 3pm" }]
  }
}
```

Returns `text/event-stream`. Events arrive in this shape:

```
data: {"content": {"parts": [{"text": "..."}]}, "author": "task_agent"}
data: {"turn_complete": true}
data: [DONE]
```

### Tasks — `/api/tasks`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/tasks` | `?status=pending\|in_progress\|done` (optional) | `ApiResponse<Task[]>` |
| `GET` | `/api/tasks/{id}` | — | `ApiResponse<Task>` |
| `GET` | `/api/tasks/search/{keyword}` | — | `ApiResponse<Task[]>` |
| `POST` | `/api/tasks` | form: `title`, `description`, `priority`, `due_date` | `ApiResponse<Task>` |
| `PATCH` | `/api/tasks/{id}` | form: any task fields | `ApiResponse<Task>` |
| `DELETE` | `/api/tasks/{id}` | — | `ApiResponse<DeleteResponse>` |

**Task model:**

```
id:          int
title:       str
description: str        = ""
priority:    str        = "medium"   # "low" | "medium" | "high"
status:      str        = "pending"  # "pending" | "in_progress" | "done"
due_date:    str | None = None       # YYYY-MM-DD
created_at:  str                     # ISO 8601
updated_at:  str        = ""
```

### Notes — `/api/notes`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/notes` | — | `ApiResponse<Note[]>` |
| `GET` | `/api/notes/{id}` | — | `ApiResponse<Note>` |
| `GET` | `/api/notes/search/{keyword}` | — | `ApiResponse<Note[]>` |
| `POST` | `/api/notes` | form: `title`, `content`, `tags` | `ApiResponse<Note>` |
| `PATCH` | `/api/notes/{id}` | form: any note fields | `ApiResponse<Note>` |
| `DELETE` | `/api/notes/{id}` | — | `ApiResponse<DeleteResponse>` |

**Note model:**

```
id:         int
title:      str
content:    str       = ""
tags:       list[str] = []   # stored as list; POST/PATCH accepts comma-separated string
created_at: str
updated_at: str       = ""
```

### Events — `/api/events`

| Method | Path | Params | Returns |
|---|---|---|---|
| `GET` | `/api/events` | — | `ApiResponse<Event[]>` |
| `GET` | `/api/events/upcoming` | `?from_date=YYYY-MM-DD` (optional) | `ApiResponse<Event[]>` |
| `GET` | `/api/events/{id}` | — | `ApiResponse<Event>` |
| `GET` | `/api/events/search/{keyword}` | — | `ApiResponse<Event[]>` |
| `POST` | `/api/events` | form: `title`, `start_time`, `end_time`, `description`, `location` | `ApiResponse<Event>` |
| `PATCH` | `/api/events/{id}` | form: any event fields | `ApiResponse<Event>` |
| `DELETE` | `/api/events/{id}` | — | `ApiResponse<DeleteResponse>` |

**Event model:**

```
id:          int
title:       str
description: str = ""
start_time:  str          # YYYY-MM-DDTHH:MM:SS
end_time:    str          # YYYY-MM-DDTHH:MM:SS
location:    str = ""
created_at:  str
```

---

## Multi-Agent System

### Root Agent (`agent.py`)

- **ADK name:** `cogni_flow_app`
- **Model:** `config.model` (Gemini 2.5 Flash via Vertex AI)
- **Timezone context:** Asia/Kolkata (IST) injected into all agent instructions
- **Routing:** inspects user intent and delegates to one sub-agent per turn

### Sub-Agents

| Agent | ADK name | Domain | Tools registered |
|---|---|---|---|
| Task Agent | `task_agent` | Tasks | `create_task`, `list_tasks`, `get_task`, `update_task`, `delete_task`, `search_tasks` |
| Notes Agent | `notes_agent` | Notes | `create_note`, `list_notes`, `get_note`, `update_note`, `delete_note`, `search_notes` |
| Schedule Agent | `schedule_agent` | Calendar events | `create_event`, `list_events`, `get_event`, `update_event`, `delete_event`, `search_events` |

### Natural Language Date/Time Resolution

Agents resolve all relative expressions **before** calling tool functions. Tools always receive dates in strict ISO format.

| Expression | Resolved format |
|---|---|
| `today`, `tomorrow`, `day after tomorrow` | `YYYY-MM-DD` |
| `in 3 days`, `in 2 weeks` | `YYYY-MM-DD` |
| `next monday`, `April 15` | `YYYY-MM-DD` |
| `3pm`, `9:30am` | time portion of `YYYY-MM-DDTHH:MM:SS` |
| `morning`, `afternoon`, `evening`, `night` | `09:00`, `14:00`, `18:00`, `21:00` |
| `noon` / `midday` | `12:00` |
| `midnight` | `00:00` |
| `for 1 hour`, `for 30 minutes` | `end_time = start_time + duration` |

---

## Logging

### Log Modes

| Mode | Condition | Format |
|---|---|---|
| Production | `GOOGLE_GENAI_USE_VERTEXAI=1` | JSON (Cloud Logging compatible) |
| Development | `GOOGLE_GENAI_USE_VERTEXAI=0` | Colored terminal output (`HH:MM:SS [LEVEL] logger:line — message`) |

### JSON Log Schema (production)

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "severity":  "INFO",
  "logger":    "cogniflow",
  "message":   "...",
  "module":    "task_service",
  "funcName":  "create",
  "lineNo":    42
}
```

### `@log_operation` Decorator

Applied to every service method. Captures `operation`, `duration_ms`, `result_type`, and `error` on failure.

```
INFO    on success
WARNING on ValueError
ERROR   on unhandled exceptions (with exc_info)
```

Usage:

```python
from cogni_flow_app.logging.decorators import log_operation

@log_operation("create_task")
def create(self, data: dict) -> Task:
    ...
```

### HTTP Request Middleware (`RequestLoggingMiddleware`)

Logs every inbound request and outbound response. Skips `/health`, `/docs`, `/openapi.json`, `/redoc`.

```
-> POST /run_sse    request_id=a1b2c3d4  client=127.0.0.1
<- 200 POST /run_sse    duration_ms=1240
```

Adds `X-Request-ID` (8-char UUID) to every response.

---

## Swapping the Storage Backend

Only the repository layer changes. Services, tools, routers, and agents are completely unaffected.

**Step 1 — Implement `BaseRepository[T]`:**

```python
from cogni_flow_app.repositories.base import BaseRepository
from cogni_flow_app.models.task import Task

class PostgresTaskRepository(BaseRepository[Task]):
    def get_all(self) -> list[Task]: ...
    def get_by_id(self, record_id: int) -> Task | None: ...
    def create(self, data: dict) -> Task: ...
    def update(self, record_id: int, data: dict) -> Task | None: ...
    def delete(self, record_id: int) -> bool: ...
    def search(self, keyword: str) -> list[Task]: ...
```

**Step 2 — Wire it into the service:**

```python
# services/task_service.py
from .postgres_task_repo import PostgresTaskRepository

task_service = TaskService(PostgresTaskRepository())
```

No other files need to change.

---

## Adding a New Entity (Open/Closed Principle)

To add a new entity (e.g. `Habit`) without modifying any existing file:

1. **Model** — `models/habit.py` with a Pydantic `Habit` class
2. **Request/Response models** — `models/requests/habit_requests.py`, `models/responses/habit_responses.py`
3. **Repository** — `repositories/json/habit_repo.py` extending `BaseJsonRepository[Habit]`
4. **Service** — `services/habit_service.py` extending `BaseService[Habit]`
5. **Tools** — `tools/habit_tools.py` with AI-callable functions backed by the service
6. **Sub-agent** — `sub_agents/habit_agent.py`, register tools
7. **Router** — `routers/habit_router.py` using `create_crud_router()`, add any custom endpoints
8. **Wire up** — include the router in `server.py`; add the sub-agent to `root_agent` in `agent.py`

Zero changes to existing files.

---

## CORS

Origins are configured via the `ALLOWED_ORIGINS` environment variable (comma-separated). Defaults:

```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
```

To add a new origin, append it to `ALLOWED_ORIGINS` in `.env`.
