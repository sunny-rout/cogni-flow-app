import os
from pathlib import Path
from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters
from ..db.tools import create_task, list_tasks, update_task
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MCP_SERVER = str(
    Path(__file__).resolve().parent.parent / "mcp_servers" / "google_mcp_server.py"
)

task_agent = Agent(
    name="task_agent",
    model=os.getenv("MODEL"),
    description=(
        "Handles everything related to tasks: creating new tasks, "
        "listing tasks by status, and updating task status."
    ),
    instruction="""You are a task management specialist.

        MANDATORY SEQUENCE for every task creation:
        Step 1: Call `create_task` — saves task to local PostgreSQL database
        Step 2: Call `create_google_task` — syncs the same task to Google Tasks
                Parameters for create_google_task:
                - title: task title (string, required)
                - notes: description (string, optional)
                - due: RFC3339 format e.g. "2026-04-10T00:00:00.000Z" (optional)

        Both steps are mandatory. Do NOT call `task_create` — it does not exist.

        For listing tasks:
        - Call `list_tasks` to show tasks from local database
        - Call `list_google_tasks` to show tasks from Google Tasks

        For updating tasks:
        - Call `update_task_status` with task_id and status (pending/in_progress/done)
        - Call `update_google_task` with task_id and updated parameters

        For deleting tasks:
        - Call `delete_task` to remove from local database or mark as deleted
        - Call `delete_google_task`.

        ALWAYS convert due dates to ISO format (YYYY-MM-DD) for create_task.
        ALWAYS convert due dates to RFC3339 (YYYY-MM-DDTHH:mm:ss.000Z) for create_google_task.

        Always confirm completion of both steps to the user.""",
    tools=[create_task,
           list_tasks,
           update_task,
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