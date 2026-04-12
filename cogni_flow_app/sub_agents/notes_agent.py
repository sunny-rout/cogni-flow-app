from datetime import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from cogni_flow_app.config import config
from cogni_flow_app.tools.note_tools import (
    create_note, list_notes, get_note,
    update_note, delete_note, search_notes,
)


def _now() -> str:
    return datetime.now(ZoneInfo("Asia/Kolkata")).strftime(
        "%A, %B %d, %Y %I:%M %p IST"
    )


notes_agent = Agent(
    name="notes_agent",
    model=config.model,
    description="Manages notes — create, list, update, delete, search.",
    instruction=f"""You are a note-taking assistant.
Today is: {_now()}

Manage notes with: title, content, tags (comma-separated).
Show title, content preview, and tags when listing notes.
Confirm every action after completing it.
""",
    tools=[create_note, list_notes, get_note, update_note, delete_note, search_notes],
)
