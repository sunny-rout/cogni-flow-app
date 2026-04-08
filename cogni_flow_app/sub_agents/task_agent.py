import os
from google.adk.agents import Agent
from cogni_flow_app.storage.tools import (
    create_task, list_tasks, get_task, search_tasks,
    update_task, delete_task
)

task_agent = Agent(
    name="task_agent",
    model=os.getenv("MODEL", "gemini-2.5-flash"),
    description="Full CRUD for tasks.",
    instruction="""You are a task management specialist.
        - create_task: create a new task
        - list_tasks: list all tasks (filter by status: pending/in_progress/done)
        - get_task: retrieve one task by ID
        - search_tasks: search tasks by keyword in title or description
        - update_task: edit title, description, priority, or due_date
        - delete_task: permanently remove a task
        Always confirm task ID and title in responses.""",
    tools=[create_task, list_tasks, get_task, search_tasks,
           update_task, delete_task],
)