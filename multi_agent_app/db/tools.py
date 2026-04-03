from .database import execute_query
from datetime import datetime

# ── TASKS ──────────────────────────────────────────────

def create_task(title: str, description: str = "",
                priority: str = "medium", due_date: str = None) -> dict:
    """Create a new task and return it."""
    query = """
        INSERT INTO tasks (title, description, priority, due_date)
        VALUES (:title, :description, :priority, :due_date)
        RETURNING *
    """
    rows = execute_query(query, {
        "title": title, "description": description,
        "priority": priority, "due_date": due_date
    })
    return rows[0] if rows else {}

def list_tasks(status: str = None) -> list:
    """List all tasks, optionally filtered by status."""
    if status:
        rows = execute_query(
            "SELECT * FROM tasks WHERE status = :status ORDER BY created_at DESC",
            {"status": status}
        )
    else:
        rows = execute_query("SELECT * FROM tasks ORDER BY created_at DESC")
    return rows

def update_task_status(task_id: int, status: str) -> dict:
    """Update a task's status (pending | in_progress | done)."""
    rows = execute_query(
        "UPDATE tasks SET status=:status, updated_at=NOW() WHERE id=:id RETURNING *",
        {"status": status, "id": task_id}
    )
    return rows[0] if rows else {}

# ── NOTES ──────────────────────────────────────────────

def create_note(title: str, content: str, tags: list = []) -> dict:
    """Create a new note."""
    rows = execute_query(
        "INSERT INTO notes (title, content, tags) VALUES (:title, :content, :tags) RETURNING *",
        {"title": title, "content": content, "tags": tags}
    )
    return rows[0] if rows else {}

def search_notes(keyword: str) -> list:
    """Search notes by keyword in title or content."""
    rows = execute_query(
        "SELECT * FROM notes WHERE title ILIKE :kw OR content ILIKE :kw",
        {"kw": f"%{keyword}%"}
    )
    return rows

# ── EVENTS ─────────────────────────────────────────────

def create_event(title: str, start_time: str,
                 end_time: str, description: str = "", location: str = "") -> dict:
    """Create a calendar event."""
    rows = execute_query(
        """INSERT INTO events (title, description, start_time, end_time, location)
           VALUES (:title, :description, :start_time, :end_time, :location) RETURNING *""",
        {"title": title, "description": description,
         "start_time": start_time, "end_time": end_time, "location": location}
    )
    return rows[0] if rows else {}

def list_events(from_date: str = None) -> list:
    """List upcoming events from a given date (defaults to now)."""
    from_date = from_date or datetime.now().isoformat()
    rows = execute_query(
        "SELECT * FROM events WHERE start_time >= :from_date ORDER BY start_time ASC",
        {"from_date": from_date}
    )
    return rows