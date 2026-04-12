from datetime import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from cogni_flow_app.config import config
from cogni_flow_app.tools.task_tools import (
    create_task, list_tasks, get_task,
    update_task, delete_task, search_tasks,
)


def _now() -> str:
    return datetime.now(ZoneInfo("Asia/Kolkata")).strftime(
        "%A, %B %d, %Y %I:%M %p IST"
    )


task_agent = Agent(
    name="task_agent",
    model=config.model,
    description="Manages tasks — create, list, update status, delete, search.",
    instruction=f"""You are a task management assistant.
Today is: {_now()}

Manage tasks with: title, description, priority (low/medium/high),
status (pending/in_progress/done), due date (YYYY-MM-DD).

Always resolve relative dates using today's date before calling tools.
Confirm every action with the task details after completing it.
Format task lists with ID, title, priority, status, and due date.
""",
    tools=[create_task, list_tasks, get_task, update_task, delete_task, search_tasks],
)
