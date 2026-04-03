
import os
from google.adk.agents import Agent
from ..db.tools import create_note, search_notes
from dotenv import load_dotenv

load_dotenv()

notes_agent = Agent(
    name="notes_agent",
    model=os.getenv("MODEL"),
    description=(
        "Handles note-taking: creating notes with optional tags "
        "and searching notes by keyword."
    ),
    instruction="""You are a notes specialist.
    - Use create_note to save a new note; ask for a title if not given
    - Use search_notes to find notes by keyword
    Always summarize what was saved or found.""",
    tools=[create_note, search_notes],
)