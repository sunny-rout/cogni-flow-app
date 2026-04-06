import asyncio
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

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDS_PATH = str(Path(__file__).resolve().parent.parent / "gcp-oauth.keys.json")
TOKEN_PATH = str(Path(__file__).resolve().parent.parent / "gcalendar_token.json")

def get_calendar_service():
    print(f"Loading Google Calendar credentials from: {CREDS_PATH}")
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())
    return build("calendar", "v3", credentials=creds)

app = Server("gcalendar-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
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
                    "event_id": {"type": "string"},
                    "title": {"type": "string"},
                    "start_time": {"type": "string", "description": "RFC3339 e.g. 2026-04-10T10:00:00+05:30"},
                    "end_time": {"type": "string", "description": "RFC3339 e.g. 2026-04-10T11:00:00+05:30"},
                    "description": {"type": "string"},
                    "location": {"type": "string"},
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
    service = get_calendar_service()

    if name == "create_google_event":
        body = {
            "summary":     arguments["title"],
            "description": arguments.get("description", ""),
            "location":    arguments.get("location", ""),
            "start":       {"dateTime": arguments["start_time"], "timeZone": "Asia/Kolkata"},
            "end":         {"dateTime": arguments["end_time"],   "timeZone": "Asia/Kolkata"},
        }
        result = service.events().insert(calendarId="primary", body=body).execute()
        return [types.TextContent(type="text", text=f"✅ Event created in Google Calendar: {result}")]
        #      ↑ wrap in a list

    elif name == "list_google_events":
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()
        result = service.events().list(
            calendarId="primary",
            timeMin=now,
            maxResults=20,
            singleEvents=True,
            orderBy="startTime"
        ).execute()
        events = result.get("items", [])
        return [types.TextContent(type="text", text=str(events))]
    
    elif name == "update_google_event":
        event_id = arguments["event_id"]
        body = {}

        if "title" in arguments:
            body["summary"] = arguments["title"]
        if "description" in arguments:
            body["description"] = arguments["description"]
        if "location" in arguments:
            body["location"] = arguments["location"]
        if "start_time" in arguments:
            body["start"] = {"dateTime": arguments["start_time"], "timeZone": "Asia/Kolkata"}
        if "end_time" in arguments:
            body["end"] = {"dateTime": arguments["end_time"], "timeZone": "Asia/Kolkata"}

        result = service.events().patch(
            calendarId="primary",
            eventId=event_id,
            body=body
        ).execute()

        return [types.TextContent(type="text", text=f"✅ Event updated in Google Calendar: {result}")]

    elif name == "delete_google_event":
        event_id = arguments["event_id"]
        service.events().delete(
            calendarId="primary",
            eventId=event_id
        ).execute()

        return [types.TextContent(type="text", text=f"✅ Event deleted from Google Calendar: {event_id}")]
    
if __name__ == "__main__":
    print(f"Initializing Google Calendar MCP Server with credentials from: {CREDS_PATH}")
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(read_stream, write_stream, app.create_initialization_options())
    asyncio.run(main())