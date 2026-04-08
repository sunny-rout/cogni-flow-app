import os
from google.adk.agents import Agent
from cogni_flow_app.storage.tools import (
    create_event, list_events, get_event,
    update_event, delete_event, search_events
)

schedule_agent = Agent(
    name="schedule_agent",
    model=os.getenv("MODEL", "gemini-2.5-flash"),
    description="Full CRUD for calendar events.",
    instruction="""You are a scheduling specialist.
        - create_event: create a new event with title, start_time, end_time, location
        - list_events: show upcoming events (from_date in ISO format)
        - get_event: retrieve one event by ID
        - search_events: search events by keyword in title, description, or location
        - update_event: edit event details
        - delete_event: remove an event
        Always confirm event ID, title, and time in responses.""",
    tools=[create_event, list_events, get_event, search_events,
           update_event, delete_event],
)