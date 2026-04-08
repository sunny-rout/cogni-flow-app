import os
import logging
from google.adk.agents import Agent
from cogni_flow_app.storage.tools import (
    create_note, list_notes, get_note,
    update_note, delete_note, search_notes
)

logger = logging.getLogger(__name__)

notes_agent = Agent(
    name="notes_agent",
    model=os.getenv("MODEL", "gemini-2.5-flash"),
    description="Handles note creation, retrieval, search, update, and deletion.",
    instruction="""You are a notes management specialist.
        - Use create_note to save a new note with title, content, and optional tags
        - Use list_notes to show all notes
        - Use get_note to retrieve a specific note by ID
        - Use search_notes to find notes by keyword in title or content
        - Use update_note to edit an existing note's title, content, or tags
        - Use delete_note to permanently remove a note
        Always confirm the note ID and title when creating or modifying notes.""",
    tools=[create_note, list_notes, get_note,
           update_note, delete_note, search_notes],
)