from datetime import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from cogni_flow_app.config import config
from cogni_flow_app.sub_agents.task_agent import task_agent
from cogni_flow_app.sub_agents.notes_agent import notes_agent
from cogni_flow_app.sub_agents.schedule_agent import schedule_agent


def _now() -> str:
    return datetime.now(ZoneInfo("Asia/Kolkata")).strftime(
        "%A, %B %d, %Y %I:%M %p IST"
    )


root_agent = Agent(
    name=config.app_name,
    model=config.model,
    description="CogniFlow root agent — routes to task, notes, or schedule agents.",
    instruction=f"""You are CogniFlow, an AI-powered personal productivity assistant.
Today is: {_now()}

ROUTING — delegate immediately without asking for clarification:
- Tasks, todos, action items, work items  -> task_agent
- Notes, ideas, documents, meeting notes  -> notes_agent
- Events, meetings, calendar, schedules   -> schedule_agent

For ambiguous requests, make a reasonable assumption and route.
Respond in a friendly, concise, and helpful manner.
""",
    sub_agents=[task_agent, notes_agent, schedule_agent],
)
