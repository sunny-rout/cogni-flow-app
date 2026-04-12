from cogni_flow_app.repositories.json.base_json_repo import BaseJsonRepository
from cogni_flow_app.models.task import Task


class JsonTaskRepository(BaseJsonRepository[Task]):
    collection_name = "tasks"
    model_class = Task
    search_fields = ["title", "description"]

    def get_by_status(self, status: str) -> list[Task]:
        return [t for t in self.get_all() if t.status == status]
