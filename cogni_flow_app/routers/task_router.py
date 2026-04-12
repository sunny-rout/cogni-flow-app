from fastapi import HTTPException
from cogni_flow_app.routers.base_router import create_crud_router
from cogni_flow_app.services import task_service
from cogni_flow_app.models.requests.task_requests import CreateTaskRequest, UpdateTaskRequest
from cogni_flow_app.models.responses.task_responses import TaskResponse, TaskListResponse

router = create_crud_router(task_service, "/api/tasks", ["Tasks"])


@router.get("/status/{status}", response_model=TaskListResponse)
def get_by_status(status: str):
    try:
        return TaskListResponse.ok(data=task_service.get_by_status(status))
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/", response_model=TaskResponse)
def create(request: CreateTaskRequest):
    try:
        result = task_service.create_task(request)
        return TaskResponse.ok(data=result, message="Task created successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.patch("/{task_id}", response_model=TaskResponse)
def update(task_id: int, request: UpdateTaskRequest):
    try:
        result = task_service.update_task(task_id, request)
        if not result:
            raise HTTPException(404, f"Task {task_id} not found")
        return TaskResponse.ok(data=result, message="Task updated successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))
