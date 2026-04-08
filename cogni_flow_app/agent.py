import os
import logging
import google.cloud.logging
from dotenv import load_dotenv

from google.adk.agents import Agent
from .sub_agents.task_agent import task_agent
from .sub_agents.schedule_agent import schedule_agent
from .sub_agents.notes_agent import notes_agent

import google.auth
import google.auth.transport.requests
import google.oauth2.id_token

# --- Setup Logging and Environment ---

cloud_logging_client = google.cloud.logging.Client()
cloud_logging_client.setup_logging()

load_dotenv()

model_name = os.getenv("MODEL")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

root_agent = Agent(
    name="multi_agent_app",
    model=model_name,
    description="CogniFlow — your personal productivity assistant.",
    instruction="""You are CogniFlow, a productivity assistant.
        Route requests to the right specialist:
        - Tasks (create, read, update, delete, status) → task_agent
        - Events & scheduling (create, read, update, delete) → schedule_agent
        - Notes (create, read, search, update, delete) → notes_agent
        Always confirm which agent handled the request and echo back key details.""",
    sub_agents=[task_agent, schedule_agent, notes_agent],
)