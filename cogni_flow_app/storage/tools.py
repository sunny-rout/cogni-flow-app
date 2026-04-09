import logging
from datetime import datetime
from .store import _read, _write, next_id

logger = logging.getLogger(__name__)

# ── TASKS ──────────────────────────────────────────────

def create_task(title: str, description: str = "",
                priority: str = "medium", due_date: str = None) -> dict:
    """Create a new task and save to JSON store."""
    tasks = _read("tasks")
    task = {
        "id": next_id(tasks),
        "title": title,
        "description": description,
        "priority": priority,
        "due_date": due_date,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    tasks.append(task)
    _write("tasks", tasks)
    logger.info(f"Task created: {task['id']} - {title}")
    return task

def list_tasks(status: str = None) -> list:
    """List all tasks, optionally filtered by status."""
    tasks = _read("tasks")
    if status:
        tasks = [t for t in tasks if t.get("status") == status]
    logger.info(f"Listed {len(tasks)} tasks (filter: {status})")
    return sorted(tasks, key=lambda x: x.get("created_at", ""), reverse=True)

def get_task(task_id: int) -> dict:
    """Get a single task by ID."""
    tasks = _read("tasks")
    for task in tasks:
        if task.get("id") == task_id:
            return task
    logger.warning(f"Task {task_id} not found")
    return {"error": f"Task {task_id} not found"}

def search_tasks(keyword: str) -> list:
    """Search tasks by keyword in title or description."""
    tasks = _read("tasks")
    kw = keyword.lower()
    results = [t for t in tasks if kw in t.get("title", "").lower()
               or kw in t.get("description", "").lower()]
    logger.info(f"Found {len(results)} tasks for keyword: {keyword}")
    return results

def update_task(task_id: int, title: str = None, description: str = None,
                priority: str = None, due_date: str = None, status: str = None) -> dict:
    """Update task fields."""
    tasks = _read("tasks")
    for task in tasks:
        if task.get("id") == task_id:
            if title: task["title"] = title
            if description: task["description"] = description
            if priority: task["priority"] = priority
            if due_date: task["due_date"] = due_date
            if status: task["status"] = status
            task["updated_at"] = datetime.now().isoformat()
            _write("tasks", tasks)
            logger.info(f"Task {task_id} updated")
            return task
    return {"error": f"Task {task_id} not found"}

def delete_task(task_id: int) -> dict:
    """Delete a task by ID."""
    tasks = _read("tasks")
    remaining = [t for t in tasks if t.get("id") != task_id]
    if len(remaining) == len(tasks):
        return {"error": f"Task {task_id} not found"}
    _write("tasks", remaining)
    logger.info(f"Task {task_id} deleted")
    return {"success": True, "deleted_id": task_id}

# ── NOTES ──────────────────────────────────────────────

def create_note(title: str, content: str, tags: list = []) -> dict:
    """Create a new note."""
    notes = _read("notes")
    note = {
        "id": next_id(notes),
        "title": title,
        "content": content,
        "tags": tags,
        "created_at": datetime.now().isoformat(),
    }
    notes.append(note)
    _write("notes", notes)
    logger.info(f"Note created: {note['id']} - {title}")
    return note

def search_notes(keyword: str) -> list:
    """Search notes by keyword in title or content."""
    notes = _read("notes")
    kw = keyword.lower()
    results = [n for n in notes if kw in n.get("title", "").lower()
               or kw in n.get("content", "").lower()]
    logger.info(f"Found {len(results)} notes for keyword: {keyword}")
    return results

def get_note(note_id: int) -> dict:
    """Get a single note by ID."""
    notes = _read("notes")
    for note in notes:
        if note.get("id") == note_id:
            return note
    return {"error": f"Note {note_id} not found"}
    
def list_notes() -> list:
    """List all notes."""
    notes = _read("notes")
    logger.info(f"Listed {len(notes)} notes")
    return sorted(notes, key=lambda x: x.get("created_at", ""), reverse=True)

def update_note(note_id: int, title: str = None,
                content: str = None, tags: list = None) -> dict:
    """Update a note's title, content, or tags."""
    notes = _read("notes")
    for note in notes:
        if note.get("id") == note_id:
            if title: note["title"] = title
            if content: note["content"] = content
            if tags is not None: note["tags"] = tags
            note["updated_at"] = datetime.now().isoformat()
            _write("notes", notes)
            logger.info(f"Note {note_id} updated")
            return note
    return {"error": f"Note {note_id} not found"}

def delete_note(note_id: int) -> dict:
    """Delete a note by ID."""
    notes = _read("notes")
    remaining = [n for n in notes if n.get("id") != note_id]
    if len(remaining) == len(notes):
        return {"error": f"Note {note_id} not found"}
    _write("notes", remaining)
    logger.info(f"Note {note_id} deleted")
    return {"success": True, "deleted_id": note_id}

# ── EVENTS ─────────────────────────────────────────────

def create_event(title: str, start_time: str,
                 end_time: str, description: str = "", location: str = "") -> dict:
    """Create a calendar event."""
    events = _read("events")
    event = {
        "id": next_id(events),
        "title": title,
        "description": description,
        "start_time": start_time,
        "end_time": end_time,
        "location": location,
        "created_at": datetime.now().isoformat(),
    }
    events.append(event)
    _write("events", events)
    logger.info(f"Event created: {event['id']} - {title}")
    return event

def get_event(event_id: int) -> dict:
    """Get a single event by ID."""
    events = _read("events")
    for event in events:
        if event.get("id") == event_id:
            return event
    return {"error": f"Event {event_id} not found"}

def search_events(keyword: str) -> list:
    """Search events by keyword in title, description, or location."""
    events = _read("events")
    kw = keyword.lower()
    results = [e for e in events if kw in e.get("title", "").lower()
               or kw in e.get("description", "").lower()
               or kw in e.get("location", "").lower()]
    logger.info(f"Found {len(results)} events for keyword: {keyword}")
    return results

def list_events(from_date: str = None) -> list:
    """List events, optionally filtered by start_time >= from_date."""
    events = _read("events")
    if from_date:
        events = [e for e in events if e.get("start_time", "") >= from_date]
    logger.info(f"Listed {len(events)} events")
    return sorted(events, key=lambda x: x.get("start_time", ""))

def update_event(event_id: int, title: str = None, description: str = None,
                 start_time: str = None, end_time: str = None,
                 location: str = None) -> dict:
    """Update an event's details."""
    events = _read("events")
    for event in events:
        if event.get("id") == event_id:
            if title: event["title"] = title
            if description: event["description"] = description
            if start_time: event["start_time"] = start_time
            if end_time: event["end_time"] = end_time
            if location: event["location"] = location
            event["updated_at"] = datetime.now().isoformat()
            _write("events", events)
            logger.info(f"Event {event_id} updated")
            return event
    return {"error": f"Event {event_id} not found"}

def delete_event(event_id: int) -> dict:
    """Delete an event by ID."""
    events = _read("events")
    remaining = [e for e in events if e.get("id") != event_id]
    if len(remaining) == len(events):
        return {"error": f"Event {event_id} not found"}
    _write("events", remaining)
    logger.info(f"Event {event_id} deleted")
    return {"success": True, "deleted_id": event_id}