from .database import execute_query
from datetime import datetime


def parse_due_date(due_date: str) -> str | None:
    """Convert natural language or partial dates to ISO format."""
    if not due_date:
        return None
    # Already valid ISO format
    try:
        datetime.fromisoformat(due_date)
        return due_date
    except ValueError:
        pass
    # Try common formats
    for fmt in ["%B %d", "%b %d", "%d %B", "%B %d %Y", "%b %d %Y"]:
        try:
            parsed = datetime.strptime(due_date, fmt)
            # If no year provided, assume current year
            if parsed.year == 1900:
                parsed = parsed.replace(year=datetime.now().year)
            return parsed.isoformat()
        except ValueError:
            continue
    return None  # If unparseable, store as NULL

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
        "priority": priority, "due_date": parse_due_date(due_date)
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

def update_task(
    task_id: int,
    title: str = None,
    description: str = None,
    priority: str = None,
    due_date: str = None,
    status: str = None,
    google_task_id: str = None,
) -> dict:
    """Update task fields."""
    fields = []
    params = {"id": task_id}

    if title is not None:
        fields.append("title = :title")
        params["title"] = title
    if description is not None:
        fields.append("description = :description")
        params["description"] = description
    if priority is not None:
        fields.append("priority = :priority")
        params["priority"] = priority
    if due_date is not None:
        fields.append("due_date = :due_date")
        params["due_date"] = parse_due_date(due_date)
    if status is not None:
        fields.append("status = :status")
        params["status"] = status
    if google_task_id is not None:
        fields.append("google_task_id = :google_task_id")
        params["google_task_id"] = google_task_id

    if not fields:
        return {}

    fields.append("updated_at = NOW()")
    query = f"UPDATE tasks SET {', '.join(fields)} WHERE id = :id RETURNING *"
    rows = execute_query(query, params)
    return rows[0] if rows else {}

def delete_task(task_id: int) -> dict:
    """Delete a task."""
    rows = execute_query(
        "DELETE FROM tasks WHERE id = :id RETURNING *",
        {"id": task_id}
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

def update_event(
    event_id: int,
    title: str = None,
    start_time: str = None,
    end_time: str = None,
    description: str = None,
    location: str = None,
    status: str = None,
    google_event_id: str = None,
) -> dict:
    """Update event fields."""
    fields = []
    params = {"id": event_id}

    if title is not None:
        fields.append("title = :title")
        params["title"] = title
    if start_time is not None:
        fields.append("start_time = :start_time")
        params["start_time"] = start_time
    if end_time is not None:
        fields.append("end_time = :end_time")
        params["end_time"] = end_time
    if description is not None:
        fields.append("description = :description")
        params["description"] = description
    if location is not None:
        fields.append("location = :location")
        params["location"] = location
    if status is not None:
        fields.append("status = :status")
        params["status"] = status
    if google_event_id is not None:
        fields.append("google_event_id = :google_event_id")
        params["google_event_id"] = google_event_id

    if not fields:
        return {}

    query = f"UPDATE events SET {', '.join(fields)} WHERE id = :id RETURNING *"
    rows = execute_query(query, params)
    return rows[0] if rows else {}

def delete_event(event_id: int) -> dict:
    """Delete an event."""
    rows = execute_query(
        "DELETE FROM events WHERE id = :id RETURNING *",
        {"id": event_id}
    )
    return rows[0] if rows else {}