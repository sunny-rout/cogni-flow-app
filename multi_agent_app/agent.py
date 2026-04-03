import os
from google.adk.agents.llm_agent import Agent
from .sub_agents.task_agent import task_agent
from .sub_agents.schedule_agent import schedule_agent
from .sub_agents.notes_agent import notes_agent
from dotenv import load_dotenv

load_dotenv()


root_agent = Agent(
    name="primary_agent",
    model=os.getenv("MODEL"),
    description="Primary coordinator for the CogniFlow productivity system.",
    instruction="""You are CogniFlow, an AI productivity coordinator.
    You have three specialist sub-agents:
    1. task_agent     - for anything about tasks (create, list, update status)
    2. schedule_agent - for events, meetings, scheduling
    3. notes_agent    - for notes (create, search)

    Analyze the user's request and delegate to the correct specialist.
    If a request spans multiple areas (e.g. 'create a task AND schedule a meeting'),
    handle each part in sequence by delegating one at a time.
    Never handle tasks/notes/events yourself — always delegate.""",
    sub_agents=[task_agent, schedule_agent, notes_agent],
)
