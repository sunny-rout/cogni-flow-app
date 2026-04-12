from cogni_flow_app.services import note_service
from cogni_flow_app.models.requests.note_requests import CreateNoteRequest, UpdateNoteRequest


def create_note(title: str, content: str = "", tags: str = "") -> dict:
    """
    Create a note.
    Args:
        title: Note title (required)
        content: Note body
        tags: Comma-separated tags e.g. 'work,meeting,idea'
    """
    try:
        return note_service.create_note(
            CreateNoteRequest(title=title, content=content, tags=tags)
        ).model_dump()
    except ValueError as e:
        return {"error": str(e)}


def list_notes() -> list:
    """List all notes sorted by newest first."""
    return [n.model_dump() for n in note_service.get_all()]


def get_note(note_id: int) -> dict:
    """Get a note by ID."""
    result = note_service.get_by_id(note_id)
    return result.model_dump() if result else {"error": f"Note {note_id} not found"}


def update_note(note_id: int, title: str = None,
                content: str = None, tags: str = None) -> dict:
    """Update note fields."""
    try:
        result = note_service.update_note(
            note_id, UpdateNoteRequest(title=title, content=content, tags=tags)
        )
        return result.model_dump() if result else {"error": f"Note {note_id} not found"}
    except ValueError as e:
        return {"error": str(e)}


def delete_note(note_id: int) -> dict:
    """Delete a note by ID."""
    deleted = note_service.delete(note_id)
    return {"success": True, "id": note_id} if deleted else {"error": f"Note {note_id} not found"}


def search_notes(keyword: str) -> list:
    """Search notes by keyword in title, content, or tags."""
    return [n.model_dump() for n in note_service.search(keyword)]
