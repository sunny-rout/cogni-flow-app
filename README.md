# CogniFlow

An AI-powered personal productivity assistant. Manage tasks, notes, and calendar events through natural language chat or direct REST API calls.

**Backend:** Python · FastAPI · Google ADK · Vertex AI (Gemini 2.5 Flash) · Pydantic v2
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS
**Storage:** JSON files (swappable via repository pattern)

---

## Folder Structure

```
CogniFlow/
├── server.py                    # FastAPI entry point
├── cogni_flow_app/              # Backend Python package
│   ├── agent.py                 # Root agent + sub-agent wiring
│   ├── config.py                # App config (env vars)
│   ├── constants.py             # Shared constants (priorities, statuses, date formats)
│   ├── models/                  # Pydantic models (Task, Note, Event, ApiResponse)
│   ├── repositories/            # Persistence layer (abstract + JSON implementations)
│   ├── services/                # Business logic
│   ├── tools/                   # AI-callable tool functions
│   ├── sub_agents/              # Specialized agents (task, notes, schedule)
│   ├── routers/                 # FastAPI routers
│   ├── logging/                 # Structured logging, middleware, decorators
│   └── storage/                 # Low-level JSON file store + legacy tool functions
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── api/                 # High-level API functions
│   │   ├── services/            # REST client, chat client, SSE parser, stream handler
│   │   ├── contexts/            # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Chat, Tasks, Notes, Events pages
│   │   ├── components/          # UI components and layout
│   │   └── types/               # TypeScript interfaces
│   └── package.json
└── supabase/                    # Database migrations (Supabase)
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Google Cloud project with Vertex AI enabled
- A service account with `roles/aiplatform.user`

---

## Quick Start

### 1. Backend

```bash
cd cogni_flow_app
pip install -r requirements.txt
```

Create `.env` in the project root:

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

API available at `http://localhost:8080`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `.env` in `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_APP_NAME=cogni_flow_app
```

```bash
npm run dev
```

App available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`/.env`)

| Variable | Default | Description |
|---|---|---|
| `MODEL` | `gemini-2.5-flash` | Gemini model ID |
| `GOOGLE_CLOUD_PROJECT` | — | GCP project ID |
| `GOOGLE_GENAI_USE_VERTEXAI` | `1` | Use Vertex AI (`1`) or AI Studio (`0`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Path to service account JSON |
| `PORT` | `8080` | Server port |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174` | Comma-separated CORS origins |

### Frontend (`/frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8080` | Backend base URL |
| `VITE_APP_NAME` | `cogni_flow_app` | ADK app name (must match backend) |

---

## Tech Stack

### Backend
| Library | Purpose |
|---|---|
| FastAPI | HTTP framework, routing |
| Google ADK | Multi-agent orchestration |
| Vertex AI (Gemini 2.5 Flash) | LLM inference |
| Pydantic v2 | Data validation and serialization |
| python-dateutil | Natural language date/time parsing |

### Frontend
| Library | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript 5.6 | Type safety |
| Vite | Build tool / dev server |
| Tailwind CSS 3 | Utility-first styling |
| react-router-dom 7 | Client-side routing |

---

## Further Reading

- [Backend Reference](./cogni_flow_app/README.md) — architecture, API reference, logging, extensibility
- [Frontend Reference](./frontend/README.md) — setup, API integration, SSE streaming, TypeScript types
