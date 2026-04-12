from cogni_flow_app.models.responses.base_response import ApiResponse
from cogni_flow_app.models.task import Task


class TaskResponse(ApiResponse[Task]):
    pass


class TaskListResponse(ApiResponse[list[Task]]):
    pass
