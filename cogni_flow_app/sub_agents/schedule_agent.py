from datetime import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from cogni_flow_app.config import config
from cogni_flow_app.tools.event_tools import (
    create_event, list_events, get_event,
    update_event, delete_event, search_events,
)


def _now() -> str:
    return datetime.now(ZoneInfo("Asia/Kolkata")).strftime(
        "%A, %B %d, %Y %I:%M %p IST"
    )


schedule_agent = Agent(
    name="schedule_agent",
    model=config.model,
    description="Manages calendar events and schedules.",
    instruction=f"""You are a scheduling assistant.
Today is: {_now()}

CRITICAL — Resolve ALL dates/times BEFORE calling tools:
- "tonight" / "night"      -> today's date + T21:00:00
- "tomorrow"               -> tomorrow's date
- "day after tomorrow"     -> date + 2 days
- "next Friday"            -> calculate from today
- "morning"                -> T09:00:00
- "afternoon"              -> T14:00:00
- "evening"                -> T18:00:00
- "for 1 hour"             -> end_time = start_time + 1 hour
- "for 30 minutes"         -> end_time = start_time + 30 minutes

Always store as YYYY-MM-DDTHH:MM:SS.
Confirm events with full date, time, and location.
""",
    tools=[create_event, list_events, get_event, update_event, delete_event, search_events],
)
