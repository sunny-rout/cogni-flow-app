from cogni_flow_app.services import task_service
from cogni_flow_app.models.requests.task_requests import CreateTaskRequest, UpdateTaskRequest


def create_task(
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: str = None
) -> dict:
    """
    Create a new task.
    Args:
        title: Task title (required)
        description: Task details
        priority: 'low', 'medium', or 'high'
        due_date: YYYY-MM-DD. Resolve ALL natural language dates
                  like 'tomorrow', 'next Friday' BEFORE calling.
    Returns: Created task dict
    """
    try:
        result = task_service.create_task(
            CreateTaskRequest(title=title, description=description,
                              priority=priority, due_date=due_date)
        )
        return result.model_dump()
    except ValueError as e:
        return {"error": str(e)}


def list_tasks(status: str = None) -> list:
    """
    List tasks.
    Args:
        status: Optional filter — 'pending', 'in_progress', 'done', or None for all
    """
    try:
        if status:
            return [t.model_dump() for t in task_service.get_by_status(status)]
        return [t.model_dump() for t in task_service.get_all()]
    except Exception as e:
        return [{"error": str(e)}]


def get_task(task_id: int) -> dict:
    """Get a single task by its ID."""
    result = task_service.get_by_id(task_id)
    return result.model_dump() if result else {"error": f"Task {task_id} not found"}


def update_task(
    task_id: int,
    title: str = None,
    description: str = None,
    priority: str = None,
    status: str = None,
    due_date: str = None
) -> dict:
    """Update task fields. Only provided (non-null) fields are changed."""
    try:
        result = task_service.update_task(
            task_id,
            UpdateTaskRequest(title=title, description=description,
                              priority=priority, status=status, due_date=due_date)
        )
        return result.model_dump() if result else {"error": f"Task {task_id} not found"}
    except ValueError as e:
        return {"error": str(e)}


def delete_task(task_id: int) -> dict:
    """Delete a task by ID."""
    deleted = task_service.delete(task_id)
    return {"success": True, "id": task_id} if deleted else {"error": f"Task {task_id} not found"}


def search_tasks(keyword: str) -> list:
    """Search tasks by keyword in title or description."""
    return [t.model_dump() for t in task_service.search(keyword)]
