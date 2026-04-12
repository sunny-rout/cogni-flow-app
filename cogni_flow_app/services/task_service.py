from typing import Optional
from cogni_flow_app.services.base import BaseService
from cogni_flow_app.repositories.base import BaseRepository
from cogni_flow_app.models.task import Task
from cogni_flow_app.models.requests.task_requests import CreateTaskRequest, UpdateTaskRequest
from cogni_flow_app.logging import log_operation


class TaskService(BaseService[Task]):
    def __init__(self, repository: BaseRepository[Task]):
        super().__init__(repository)

    @log_operation("get_by_status")
    def get_by_status(self, status: str) -> list[Task]:
        return [t for t in self._repo.get_all() if t.status == status]

    @log_operation("create_task")
    def create_task(self, request: CreateTaskRequest) -> Task:
        return self._repo.create(request.model_dump())

    @log_operation("update_task")
    def update_task(self, task_id: int, request: UpdateTaskRequest) -> Optional[Task]:
        data = {k: v for k, v in request.model_dump().items() if v is not None}
        return self._repo.update(task_id, data)
