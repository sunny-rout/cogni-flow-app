import asyncio
import sys
import os
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SCOPES = ["https://www.googleapis.com/auth/tasks"]
CREDS_PATH = str(Path(__file__).resolve().parent.parent / "gcp-oauth.keys.json")
TOKEN_PATH = str(Path(__file__).resolve().parent.parent / "gtasks_token.json")

def get_tasks_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())
    return build("tasks", "v1", credentials=creds)

app = Server("gtasks-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="create_google_task",
            description="Create a task in Google Tasks.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "notes": {"type": "string", "default": ""},
                    "due":   {"type": "string", "description": "RFC3339 e.g. 2026-04-10T00:00:00.000Z"},
                },
                "required": ["title"],
            },
        ),
        types.Tool(
            name="list_google_tasks",
            description="List all tasks from Google Tasks.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="update_google_task",
            description="Update an existing Google Task by task ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "title": {"type": "string"},
                    "notes": {"type": "string"},
                    "due": {"type": "string", "description": "RFC3339 date; Google Tasks stores only the date part"},
                    "status": {"type": "string", "description": "needsAction or completed"},
                },
                "required": ["task_id"],
            },
        ),
        types.Tool(
            name="delete_google_task",
            description="Delete a Google Task by task ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                },
                "required": ["task_id"],
            },
        ),
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    service = get_tasks_service()

    if name == "create_google_task":
        body = {"title": arguments["title"]}
        if arguments.get("notes"):
            body["notes"] = arguments["notes"]
        if arguments.get("due"):
            body["due"] = arguments["due"]
        result = service.tasks().insert(tasklist="@default", body=body).execute()
        return [types.TextContent(type="text", text=f"Task created in Google Tasks: {result}")]

    elif name == "list_google_tasks":
        result = service.tasks().list(tasklist="@default").execute()
        tasks = result.get("items", [])
        return [types.TextContent(type="text", text=str(tasks))]
    
    elif name == "update_google_task":
        task_id = arguments["task_id"]
        body = {}

        if "title" in arguments:
            body["title"] = arguments["title"]
        if "notes" in arguments:
            body["notes"] = arguments["notes"]
        if "due" in arguments:
            body["due"] = arguments["due"]
        if "status" in arguments:
            body["status"] = arguments["status"]

        if arguments.get("status") == "completed":
            from datetime import datetime, timezone
            body["completed"] = datetime.now(timezone.utc).isoformat()

        result = service.tasks().patch(
            tasklist="@default",
            task=task_id,
            body=body
        ).execute()

        return [types.TextContent(type="text", text=f"✅ Task updated in Google Tasks: {result}")]

    elif name == "delete_google_task":
        task_id = arguments["task_id"]

        service.tasks().delete(
            tasklist="@default",
            task=task_id
        ).execute()

        return [types.TextContent(type="text", text=f"✅ Task deleted from Google Tasks: {task_id}")]

if __name__ == "__main__":
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())
    asyncio.run(main())