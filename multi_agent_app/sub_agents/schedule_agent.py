
import os
from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from ..db.tools import create_event, list_events
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GOOGLE_MCP_SERVER = str(Path(__file__).resolve().parent.parent / "mcp_servers" / "google_mcp_server.py")

# Absolute path to credentials file — works regardless of where adk web is launched
CREDS_PATH = str(Path(__file__).resolve().parent.parent / "gcp-oauth.keys.json")
print(f"Using Google OAuth credentials from: {CREDS_PATH}")

current_date = datetime.now().strftime("%A, %B %d, %Y")
current_year = datetime.now().year

schedule_agent = Agent(
    name="schedule_agent",
    model=os.getenv("MODEL"),
    description=(
        "Handles all scheduling: creating calendar events, listing upcoming "
        "events, and syncing with Google Calendar."
    ),
    instruction=f"""You are a scheduling specialist.
        The current date is {current_date}. Always use this as reference for resolving dates.

        For every event creation, you MUST call both tools in order:
        1. `create_event` — save to local database
        2. `create_google_event` — sync to Google Calendar

        For listing: call both `list_events` and `list_google_events`.
        For updates: call `update_event_status` with event_id and status.
        For delete/cancel: remove or mark locally as needed, and call `delete_google_event` for Google Calendar.

        Always use RFC3339 with +05:30 IST offset for Google Calendar dates.
        Always infer the current year ({current_year}) when year is not specified.""",
    tools=[create_event,
            list_events,
            MCPToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command="python",
                    args=[GOOGLE_MCP_SERVER],
                ),
                timeout=30,
            ),
        ),
    ],
)