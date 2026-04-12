import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from cogni_flow_app.config import config
from cogni_flow_app.logging import app_logger, RequestLoggingMiddleware
from cogni_flow_app.models.requests.chat_requests import ChatRequest
from cogni_flow_app.models.responses.base_response import ApiResponse
from cogni_flow_app.models.responses.common_responses import (
    HealthResponse, HealthData,
    SessionResponse, SessionData,
)
from cogni_flow_app.agent import root_agent
from cogni_flow_app.routers.task_router import router as task_router
from cogni_flow_app.routers.note_router import router as note_router
from cogni_flow_app.routers.event_router import router as event_router

app = FastAPI(title="CogniFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ApiResponse.fail(f"Internal server error: {str(exc)}").model_dump(),
    )


app.include_router(task_router)
app.include_router(note_router)
app.include_router(event_router)

session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=config.app_name,
    session_service=session_service,
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse.ok(
        data=HealthData(status="healthy", service="cogniflow-api"),
        message="Service is running",
    )


@app.post(
    "/apps/{app_name}/users/{user_id}/sessions/{session_id}",
    response_model=SessionResponse,
)
async def create_session(app_name: str, user_id: str, session_id: str):
    existing = await session_service.get_session(
        app_name=app_name, user_id=user_id, session_id=session_id
    )
    if not existing:
        await session_service.create_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
    return SessionResponse.ok(
        data=SessionData(session_id=session_id, user_id=user_id, status="created"),
        message="Session created",
    )


@app.get("/apps/{app_name}/users/{user_id}/sessions")
async def list_sessions(app_name: str, user_id: str):
    return ApiResponse.ok(
        data=await session_service.list_sessions(app_name=app_name, user_id=user_id)
    )


@app.post("/run_sse")
async def run_sse(request: ChatRequest):
    async def stream():
        try:
            existing = await session_service.get_session(
                app_name=request.app_name,
                user_id=request.user_id,
                session_id=request.session_id,
            )
            if not existing:
                await session_service.create_session(
                    app_name=request.app_name,
                    user_id=request.user_id,
                    session_id=request.session_id,
                )

            content = Content(
                role="user",
                parts=[Part(text=request.new_message.parts[0].text)],
            )
            async for event in runner.run_async(
                user_id=request.user_id,
                session_id=request.session_id,
                new_message=content,
            ):
                yield f"data: {event.model_dump_json()}\n\n"
        except Exception as e:
            error_event = {
                "author": "system",
                "content": {"role": "model", "parts": [{"text": f"Error: {str(e)}"}]},
                "turn_complete": True,
            }
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    app_logger.info(
        "Starting CogniFlow API",
        extra={"port": config.port, "model": config.model},
    )
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=config.port,
        reload=True,
    )
