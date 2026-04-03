
import os
from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from ..db.tools import create_event, list_events
from dotenv import load_dotenv

load_dotenv()

# Absolute path to credentials file — works regardless of where adk web is launched
CREDS_PATH = str(Path(__file__).resolve().parent.parent / "gcp-oauth.keys.json")
print(f"Using Google OAuth credentials from: {CREDS_PATH}")

schedule_agent = Agent(
    name="schedule_agent",
    model=os.getenv("MODEL"),
    description=(
        "Handles all scheduling: creating calendar events, listing upcoming "
        "events, and syncing with Google Calendar."
    ),
    instruction="""You are a scheduling specialist.
    - Use create_event to save events to the database
    - Use list_events to show upcoming events
    - Use Google Calendar MCP tools (if available) to sync with real Google Calendar
    Always confirm bookings and mention the event time clearly.""",
    tools=[create_event,
            list_events,
            MCPToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command="npx",
                    args=["-y", "@cocal/google-calendar-mcp"],
                    env={
                        "GOOGLE_OAUTH_CREDENTIALS": CREDS_PATH,
                    },
                ),
                timeout=10,
            ),
        ),
    ],
)