import os
from google.adk.agents import Agent
from ..db.tools import create_task, list_tasks, update_task_status
from dotenv import load_dotenv

load_dotenv()

task_agent = Agent(
    name="task_agent",
    model=os.getenv("MODEL"),
    description=(
        "Handles everything related to tasks: creating new tasks, "
        "listing tasks by status, and updating task status."
    ),
    instruction="""You are a task management specialist.
    - Use create_task to add new tasks (ask for priority and due date if not given)
    - Use list_tasks to show tasks; filter by status when asked
    - Use update_task_status to mark tasks as pending, in_progress, or done
    Always confirm the action and show the updated task details.""",
    tools=[create_task, list_tasks, update_task_status],
)