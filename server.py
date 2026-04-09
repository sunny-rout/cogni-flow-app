import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.cloud.logging                        
from dotenv import load_dotenv

from google.adk.sessions import InMemorySessionService, Session   
from google.adk.runners import Runner       
from sse_starlette.sse import EventSourceResponse  

import google.cloud.logging
from dotenv import load_dotenv

# Setup logging
cloud_logging_client = google.cloud.logging.Client()
cloud_logging_client.setup_logging()

load_dotenv()

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Import existing root_agent from cogni_flow_app
from cogni_flow_app.agent import root_agent
from cogni_flow_app.storage.tools import (
    # Tasks
    create_task, list_tasks, get_task, search_tasks, update_task, delete_task,
    # Notes
    create_note, list_notes, get_note, search_notes, update_note, delete_note,
    # Events
    create_event, list_events, get_event, search_events, update_event, delete_event,
)

# Session service
session_service = InMemorySessionService()

# Runner
runner = Runner(agent=root_agent, app_name="multi_agent_app", session_service=session_service)


class MessagePart(BaseModel):
    text: Optional[str] = None


class Message(BaseModel):
    role: str
    parts: list[MessagePart]


class ChatRequest(BaseModel):
    app_name: str = "multi_agent_app"
    user_id: str
    session_id: str
    new_message: Message


class SessionCreate(BaseModel):
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CogniFlow API server starting up...")
    yield
    logger.info("CogniFlow API server shutting down...")


app = FastAPI(title="CogniFlow API", lifespan=lifespan)

# CORS middleware - allow localhost:5173 (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "cogniflow-api"}


@app.post("/apps/{app_name}/users/{user_id}/sessions/{session_id}")
async def create_session(app_name: str, user_id: str, session_id: str):
    """Create a new session."""
    try:
        session = await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
        )
        return {"session": session}
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/apps/{app_name}/users/{user_id}/sessions")
async def get_sessions(app_name: str, user_id: str):
    """List all sessions for a user."""
    try:
        sessions = await session_service.list_sessions(
            app_name=app_name,
            user_id=user_id,
        )
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Failed to list sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def generate_events(request: ChatRequest):
    """Generator for SSE events."""
    try:
        session: Session = await session_service.get_session(
            app_name=request.app_name,
            user_id=request.user_id,
            session_id=request.session_id,
        )
        if not session:
            session = await session_service.create_session(
                app_name=request.app_name,
                user_id=request.user_id,
                session_id=request.session_id,
            )

        # Run the agent using async runner
        response_stream = runner.run_async(
            user_id=request.user_id,
            session_id=request.session_id,
            new_message=request.new_message,
        )

        async for event in response_stream:
            # Debug: log event type and content
            logger.info(f"Event type: {type(event)}, event: {event}")

            # Handle plain string events
            if isinstance(event, str):
                json_data = {
                    "role": "model",
                    "content": {"parts": [{"text": event}]}
                }
                yield {"event": "message", "data": json.dumps(json_data)}
                continue

            # Handle object events
            text = None
            if hasattr(event, 'content') and event.content:
                content = event.content
                if isinstance(content, str):
                    text = content
                elif hasattr(content, 'parts') and content.parts:
                    for part in content.parts:
                        if hasattr(part, 'text') and part.text:
                            text = (text or "") + part.text
                elif hasattr(content, 'text'):
                    text = content.text

            if text:
                json_data = {
                    "role": "model",
                    "content": {"parts": [{"text": text}]}
                }
                yield {"event": "message", "data": json.dumps(json_data)}

        yield {"event": "message", "data": '"[DONE]"'}

    except Exception as e:
        logger.error(f"SSE error: {e}")
        yield {"event": "error", "data": str(e)}


@app.post("/run_sse")
async def run_sse(request: ChatRequest):
    """Streaming chat endpoint (SSE)."""
    return EventSourceResponse(generate_events(request))


@app.post("/run")
async def run_nonstreaming(request: ChatRequest):
    """Non-streaming chat endpoint."""
    try:
        session: Session = await session_service.get_session(
            app_name=request.app_name,
            user_id=request.user_id,
            session_id=request.session_id,
        )
        if not session:
            session = await session_service.create_session(
                app_name=request.app_name,
                user_id=request.user_id,
                session_id=request.session_id,
            )

        query = request.new_message.parts[0].text if request.new_message.parts else ""

        response_stream = runner.run(
            user_id=request.user_id,
            session_id=request.session_id,
            new_message=query,
        )

        full_response = ""
        async for event in response_stream:
            if hasattr(event, 'content') and event.content:
                for part in event.content.parts:
                    if hasattr(part, 'text') and part.text:
                        full_response += part.text

        return {"response": full_response}

    except Exception as e:
        logger.error(f"Run error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/events/search/{keyword}")
async def search_events_keyword(keyword: str):
    return search_events(keyword)


# ── REST API Endpoints ───────────────────────────────────

from fastapi import Query

# Tasks
@app.get("/api/tasks")
async def get_tasks(status: str = Query(None)):
    return list_tasks(status=status)

@app.get("/api/tasks/{task_id}")
async def get_single_task(task_id: int):
    return get_task(task_id)

@app.post("/api/tasks")
async def create_new_task(
    title: str = Query(...),
    description: str = Query(""),
    priority: str = Query("medium"),
    due_date: str = Query(None)
):
    return create_task(title, description, priority, due_date)

@app.patch("/api/tasks/{task_id}")
async def update_existing_task(
    task_id: int,
    title: str = Query(None),
    description: str = Query(None),
    priority: str = Query(None),
    due_date: str = Query(None),
    status: str = Query(None)
):
    return update_task(task_id, title, description, priority, due_date, status)

@app.delete("/api/tasks/{task_id}")
async def delete_existing_task(task_id: int):
    return delete_task(task_id)

@app.get("/api/tasks/search/{keyword}")
async def search_tasks_keyword(keyword: str):
    return search_tasks(keyword)

# Notes
@app.get("/api/notes")
async def get_notes():
    return list_notes()

@app.get("/api/notes/{note_id}")
async def get_single_note(note_id: int):
    return get_note(note_id)

@app.post("/api/notes")
async def create_new_note(
    title: str = Query(...),
    content: str = Query(""),
    tags: str = Query("")
):
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    return create_note(title, content, tags_list)

@app.patch("/api/notes/{note_id}")
async def update_existing_note(
    note_id: int,
    title: str = Query(None),
    content: str = Query(None),
    tags: str = Query(None)
):
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    return update_note(note_id, title, content, tags_list)

@app.delete("/api/notes/{note_id}")
async def delete_existing_note(note_id: int):
    return delete_note(note_id)

@app.get("/api/notes/search/{keyword}")
async def search_notes_keyword(keyword: str):
    return search_notes(keyword)

# Events
@app.get("/api/events")
async def get_events(from_date: str = Query(None)):
    return list_events(from_date=from_date)

@app.get("/api/events/{event_id}")
async def get_single_event(event_id: int):
    return get_event(event_id)

@app.post("/api/events")
async def create_new_event(
    title: str = Query(...),
    start_time: str = Query(...),
    end_time: str = Query(""),
    description: str = Query(""),
    location: str = Query("")
):
    return create_event(title, start_time, end_time, description, location)

@app.patch("/api/events/{event_id}")
async def update_existing_event(
    event_id: int,
    title: str = Query(None),
    description: str = Query(None),
    start_time: str = Query(None),
    end_time: str = Query(None),
    location: str = Query(None)
):
    return update_event(event_id, title, description, start_time, end_time, location)

@app.delete("/api/events/{event_id}")
async def delete_existing_event(event_id: int):
    return delete_event(event_id)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
