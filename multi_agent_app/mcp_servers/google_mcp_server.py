# multi_agent_app/mcp_servers/google_mcp_server.py
import asyncio
import sys
import os
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
from dotenv import load_dotenv
from googleapiclient.discovery import build
from datetime import datetime, timezone
from google_auth import get_credentials

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ── Service Registry ────────────────────────────────────
SERVICE_REGISTRY = {
    "tasks": {
        "scopes":        ["https://www.googleapis.com/auth/tasks"],
        "token_filename": "gtasks_token.json",
        "service_name":  "tasks",
        "version":       "v1",
    },
    "calendar": {
        "scopes":        ["https://www.googleapis.com/auth/calendar"],
        "token_filename": "gcalendar_token.json",
        "service_name":  "calendar",
        "version":       "v3",
    },
}

def get_service(name: str):
    """Get a Google API service client by registry name."""
    config = SERVICE_REGISTRY[name]
    creds = get_credentials(config["scopes"], config["token_filename"])
    return build(config["service_name"], config["version"], credentials=creds)

# ── MCP Server ──────────────────────────────────────────
app = Server("google-mcp-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [

        # ── TASKS ─────────────────────────────────────
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
                    "title":   {"type": "string"},
                    "notes":   {"type": "string"},
                    "due":     {"type": "string"},
                    "status":  {"type": "string", "description": "needsAction or completed"},
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

        # ── CALENDAR ──────────────────────────────────
        types.Tool(
            name="create_google_event",
            description="Create an event in Google Calendar.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title":       {"type": "string"},
                    "start_time":  {"type": "string", "description": "RFC3339 e.g. 2026-04-10T10:00:00+05:30"},
                    "end_time":    {"type": "string", "description": "RFC3339 e.g. 2026-04-10T11:00:00+05:30"},
                    "description": {"type": "string", "default": ""},
                    "location":    {"type": "string", "default": ""},
                },
                "required": ["title", "start_time", "end_time"],
            },
        ),
        types.Tool(
            name="list_google_events",
            description="List upcoming events from Google Calendar.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="update_google_event",
            description="Update an existing Google Calendar event by event ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "event_id":    {"type": "string"},
                    "title":       {"type": "string"},
                    "start_time":  {"type": "string"},
                    "end_time":    {"type": "string"},
                    "description": {"type": "string"},
                    "location":    {"type": "string"},
                },
                "required": ["event_id"],
            },
        ),
        types.Tool(
            name="delete_google_event",
            description="Delete a Google Calendar event by event ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "event_id": {"type": "string"},
                },
                "required": ["event_id"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict):

    # ── TASKS ─────────────────────────────────────────
    if name == "create_google_task":
        service = get_service("tasks")
        body = {"title": arguments["title"]}
        if arguments.get("notes"): body["notes"] = arguments["notes"]
        if arguments.get("due"):   body["due"]   = arguments["due"]
        result = service.tasks().insert(tasklist="@default", body=body).execute()
        return [types.TextContent(type="text", text=f"✅ Task created: {result}")]

    elif name == "list_google_tasks":
        service = get_service("tasks")
        result = service.tasks().list(tasklist="@default").execute()
        return [types.TextContent(type="text", text=str(result.get("items", [])))]

    elif name == "update_google_task":
        service = get_service("tasks")
        body = {}
        if "title"  in arguments: body["title"]  = arguments["title"]
        if "notes"  in arguments: body["notes"]  = arguments["notes"]
        if "due"    in arguments: body["due"]    = arguments["due"]
        if "status" in arguments:
            body["status"] = arguments["status"]
            if arguments["status"] == "completed":
                body["completed"] = datetime.now(timezone.utc).isoformat()
        result = service.tasks().patch(
            tasklist="@default", task=arguments["task_id"], body=body
        ).execute()
        return [types.TextContent(type="text", text=f"✅ Task updated: {result}")]

    elif name == "delete_google_task":
        service = get_service("tasks")
        service.tasks().delete(
            tasklist="@default", task=arguments["task_id"]
        ).execute()
        return [types.TextContent(type="text", text=f"✅ Task deleted: {arguments['task_id']}")]

    # ── CALENDAR ──────────────────────────────────────
    elif name == "create_google_event":
        service = get_service("calendar")
        body = {
            "summary":     arguments["title"],
            "description": arguments.get("description", ""),
            "location":    arguments.get("location", ""),
            "start":       {"dateTime": arguments["start_time"], "timeZone": "Asia/Kolkata"},
            "end":         {"dateTime": arguments["end_time"],   "timeZone": "Asia/Kolkata"},
        }
        result = service.events().insert(calendarId="primary", body=body).execute()
        return [types.TextContent(type="text", text=f"✅ Event created: {result}")]

    elif name == "list_google_events":
        service = get_service("calendar")
        now = datetime.now(timezone.utc).isoformat()
        result = service.events().list(
            calendarId="primary", timeMin=now,
            maxResults=20, singleEvents=True, orderBy="startTime"
        ).execute()
        return [types.TextContent(type="text", text=str(result.get("items", [])))]

    elif name == "update_google_event":
        service = get_service("calendar")
        body = {}
        if "title"       in arguments: body["summary"]     = arguments["title"]
        if "description" in arguments: body["description"] = arguments["description"]
        if "location"    in arguments: body["location"]    = arguments["location"]
        if "start_time"  in arguments: body["start"]       = {"dateTime": arguments["start_time"], "timeZone": "Asia/Kolkata"}
        if "end_time"    in arguments: body["end"]         = {"dateTime": arguments["end_time"],   "timeZone": "Asia/Kolkata"}
        result = service.events().patch(
            calendarId="primary", eventId=arguments["event_id"], body=body
        ).execute()
        return [types.TextContent(type="text", text=f"✅ Event updated: {result}")]

    elif name == "delete_google_event":
        service = get_service("calendar")
        service.events().delete(
            calendarId="primary", eventId=arguments["event_id"]
        ).execute()
        return [types.TextContent(type="text", text=f"✅ Event deleted: {arguments['event_id']}")]


if __name__ == "__main__":
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())
    asyncio.run(main())